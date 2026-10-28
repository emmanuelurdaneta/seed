import { INestApplication } from '@nestjs/common';
import axios from 'axios';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { initTestApp } from './utils/test-app';
import {
  MockReply,
  networkError,
  notFound,
  ok,
  serverError,
} from './utils/axios-responses';

interface UserBody {
  id: string;
  name: string;
  email: string;
  characterIds?: number[];
  characters?: string[];
}

interface ErrorBody {
  statusCode: number;
  message: string | string[];
}

const MISSING_USER_ID = 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b';

// Spy de axios.get: cada clave es el endpoint con sus parámetros (path) y el mock aplica
// cuando la URL pedida lo CONTIENE. Así 'https://swapi.dev/api/people/1/' y
// 'http://localhost:3000/people/1/' coinciden por '/people/1/'.
// Un GET sin mock falla, así ningún test sale a internet.
const mockAxiosGet = (routes: Record<string, MockReply>) =>
  jest.spyOn(axios, 'get').mockImplementation(((url: string) => {
    const path = Object.keys(routes).find((route) => url.includes(route));
    return path
      ? routes[path](url)
      : Promise.reject(new Error(`No axios.get mock for ${url}`));
  }) as typeof axios.get);

// URLs pedidas con axios.get, en orden
const requestedUrls = (getSpy: jest.SpyInstance): string[] =>
  getSpy.mock.calls.map(([url]) => url as string);

describe('Users (e2e)', () => {
  let app: INestApplication;
  let usersTable: Repository<User>;

  beforeAll(async () => {
    app = await initTestApp();
    usersTable = app.get(DataSource).getRepository(User);
  });

  beforeEach(async () => {
    await usersTable.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  // Carga el usuario directo en la base, sin pasar por la API ni por SWAPI
  const seedUser = (data: Partial<User> = {}): Promise<User> =>
    usersTable.save(
      usersTable.create({
        name: 'Ana',
        email: 'ana@example.com',
        characterIds: [],
        ...data,
      }),
    );

  describe('POST /users', () => {
    it('creates the user and stores the character ids', async () => {
      const getSpy = mockAxiosGet({
        '/people/1/': ok({ name: 'Luke Skywalker' }),
        '/people/4/': ok({ name: 'Darth Vader' }),
      });

      const response = await api()
        .post('/users')
        .send({ name: 'Ana', email: 'ana@example.com', characterIds: [1, 4] })
        .expect(201);

      const user = response.body as UserBody;
      expect(user.characterIds).toEqual([1, 4]);
      expect(requestedUrls(getSpy)).toEqual([
        expect.stringContaining('/people/1/'),
        expect.stringContaining('/people/4/'),
      ]);
      const stored = await usersTable.findOneBy({ id: user.id });
      expect(stored?.characterIds).toEqual([1, 4]);
    });

    it('creates a user without characters and does not call SWAPI', async () => {
      const getSpy = jest.spyOn(axios, 'get');

      const response = await api()
        .post('/users')
        .send({ name: 'Ana', email: 'ana@example.com' })
        .expect(201);

      expect((response.body as UserBody).characterIds).toEqual([]);
      expect(getSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when a character does not exist in SWAPI', async () => {
      mockAxiosGet({
        '/people/1/': ok({ name: 'Luke Skywalker' }),
        '/people/9999/': notFound(),
      });

      const response = await api()
        .post('/users')
        .send({
          name: 'Ana',
          email: 'ana@example.com',
          characterIds: [1, 9999],
        })
        .expect(400);

      expect((response.body as ErrorBody).message).toContain('9999');
      expect(await usersTable.count()).toBe(0);
    });

    it('returns 400 when the body is invalid', async () => {
      const response = await api()
        .post('/users')
        .send({ name: '', email: 'not-an-email', role: 'admin' })
        .expect(400);

      expect((response.body as ErrorBody).message).toEqual(
        expect.arrayContaining([
          'property role should not exist',
          'email must be an email',
        ]),
      );
    });

    it('returns 409 when the email is already in use', async () => {
      await seedUser();

      await api()
        .post('/users')
        .send({ name: 'Otra', email: 'ana@example.com' })
        .expect(409);
      expect(await usersTable.count()).toBe(1);
    });

    it('returns 502 and saves nothing when SWAPI is down', async () => {
      mockAxiosGet({ '/people/1/': networkError() });

      await api()
        .post('/users')
        .send({ name: 'Ana', email: 'ana@example.com', characterIds: [1] })
        .expect(502);
      expect(await usersTable.count()).toBe(0);
    });
  });

  describe('GET /users', () => {
    it('lists the users with their character ids without calling SWAPI', async () => {
      await seedUser({ characterIds: [1] });
      await seedUser({ email: 'luis@example.com', characterIds: [4, 10] });
      const getSpy = jest.spyOn(axios, 'get');

      const response = await api().get('/users').expect(200);

      const users = response.body as UserBody[];
      expect(users.map((user) => user.characterIds)).toEqual([[1], [4, 10]]);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('returns the character names from SWAPI in the stored order', async () => {
      const { id } = await seedUser({ characterIds: [10, 1, 4] });
      const getSpy = mockAxiosGet({
        '/people/1/': ok({ name: 'Luke Skywalker' }),
        '/people/4/': ok({ name: 'Darth Vader' }),
        '/people/10/': ok({ name: 'Obi-Wan Kenobi' }),
      });

      const response = await api().get(`/users/${id}`).expect(200);

      const user = response.body as UserBody;
      expect(user.characters).toEqual([
        'Obi-Wan Kenobi',
        'Luke Skywalker',
        'Darth Vader',
      ]);
      expect(user).not.toHaveProperty('characterIds');
      expect(requestedUrls(getSpy)).toEqual([
        expect.stringContaining('/people/10/'),
        expect.stringContaining('/people/1/'),
        expect.stringContaining('/people/4/'),
      ]);
    });

    it('returns 404 when the user does not exist', async () => {
      await api().get(`/users/${MISSING_USER_ID}`).expect(404);
    });

    it('returns 400 when the id is not a UUID', async () => {
      await api().get('/users/123').expect(400);
    });

    it('returns 502 when SWAPI fails while reading', async () => {
      const { id } = await seedUser({ characterIds: [1] });
      mockAxiosGet({ '/people/1/': serverError() });

      await api().get(`/users/${id}`).expect(502);
    });
  });

  describe('PATCH /users/:id', () => {
    it('updates the name and keeps the characters without calling SWAPI', async () => {
      const { id } = await seedUser({ characterIds: [1] });
      const getSpy = jest.spyOn(axios, 'get');

      const response = await api()
        .patch(`/users/${id}`)
        .send({ name: 'Ana María' })
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Ana María',
        characterIds: [1],
      });
      expect(getSpy).not.toHaveBeenCalled();
    });

    it('replaces the characters', async () => {
      const { id } = await seedUser({ characterIds: [1] });
      mockAxiosGet({
        '/people/4/': ok({ name: 'Darth Vader' }),
        '/people/10/': ok({ name: 'Obi-Wan Kenobi' }),
      });

      await api()
        .patch(`/users/${id}`)
        .send({ characterIds: [4, 10] })
        .expect(200);

      const stored = await usersTable.findOneBy({ id });
      expect(stored?.characterIds).toEqual([4, 10]);
    });

    it('returns 400 and keeps the data when a new character does not exist', async () => {
      const { id } = await seedUser({ characterIds: [1] });
      mockAxiosGet({ '/people/9999/': notFound() });

      await api()
        .patch(`/users/${id}`)
        .send({ characterIds: [9999] })
        .expect(400);

      const stored = await usersTable.findOneBy({ id });
      expect(stored?.characterIds).toEqual([1]);
    });

    it('returns 409 when the email belongs to another user', async () => {
      await seedUser();
      const { id } = await seedUser({ email: 'luis@example.com' });

      await api()
        .patch(`/users/${id}`)
        .send({ email: 'ana@example.com' })
        .expect(409);
    });

    it('returns 404 when the user does not exist', async () => {
      await api()
        .patch(`/users/${MISSING_USER_ID}`)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes the user', async () => {
      const { id } = await seedUser();

      await api()
        .delete(`/users/${id}`)
        .expect(200)
        .expect({ message: `User with id ${id} deleted` });

      expect(await usersTable.count()).toBe(0);
    });

    it('returns 404 when the user does not exist', async () => {
      await api().delete(`/users/${MISSING_USER_ID}`).expect(404);
    });
  });
});
