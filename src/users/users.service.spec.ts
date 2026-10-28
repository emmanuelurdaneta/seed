import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b',
  name: 'Ana',
  email: 'ana@example.com',
  characterIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            getCharacterNames: jest.fn(),
            findByEmail: jest.fn(),
            findMissingCharacterIds: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
  });

  describe('create', () => {
    it('creates the user with an empty character list by default', async () => {
      const user = buildUser();
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(user);

      await expect(
        service.create({ name: 'Ana', email: 'ana@example.com' }),
      ).resolves.toBe(user);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'ana@example.com',
        characterIds: [],
      });
      expect(repository.findMissingCharacterIds).not.toHaveBeenCalled();
    });

    it('creates the user when every character exists', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findMissingCharacterIds.mockResolvedValue([]);
      repository.create.mockResolvedValue(buildUser({ characterIds: [1, 25] }));

      await service.create({
        name: 'Ana',
        email: 'ana@example.com',
        characterIds: [1, 25],
      });

      expect(repository.findMissingCharacterIds).toHaveBeenCalledWith([1, 25]);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ characterIds: [1, 25] }),
      );
    });

    it('throws BadRequestException when a character does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findMissingCharacterIds.mockResolvedValue([99999]);

      await expect(
        service.create({
          name: 'Ana',
          email: 'ana@example.com',
          characterIds: [1, 99999],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the email is taken', async () => {
      repository.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.create({ name: 'Otra', email: 'ana@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  it('returns all users', async () => {
    const users = [buildUser()];
    repository.findAll.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toBe(users);
  });

  describe('findOne', () => {
    it('builds the response replacing the character ids with their names', async () => {
      const user = buildUser({ characterIds: [4, 1] });
      repository.findOne.mockResolvedValue(user);
      repository.getCharacterNames.mockResolvedValue([
        'Darth Vader',
        'Luke Skywalker',
      ]);

      const result = await service.findOne(user.id);

      expect(repository.getCharacterNames).toHaveBeenCalledWith([4, 1]);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        characters: ['Darth Vader', 'Luke Skywalker'],
      });
      expect(result).not.toHaveProperty('characterIds');
    });

    it('throws NotFoundException without calling the API when the user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.getCharacterNames).not.toHaveBeenCalled();
    });

    it('propagates the error when the API fails', async () => {
      repository.findOne.mockResolvedValue(buildUser({ characterIds: [1] }));
      repository.getCharacterNames.mockRejectedValue(
        new BadGatewayException('SWAPI is not available'),
      );

      await expect(service.findOne('some-id')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('update', () => {
    it('updates the user', async () => {
      const user = buildUser({ name: 'Ana María' });
      repository.update.mockResolvedValue(user);

      await expect(
        service.update(user.id, { name: 'Ana María' }),
      ).resolves.toBe(user);
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.findMissingCharacterIds).not.toHaveBeenCalled();
    });

    it('allows keeping the same email', async () => {
      const user = buildUser();
      repository.findByEmail.mockResolvedValue(user);
      repository.update.mockResolvedValue(user);

      await expect(
        service.update(user.id, { email: user.email }),
      ).resolves.toBe(user);
    });

    it('throws ConflictException when the email belongs to another user', async () => {
      repository.findByEmail.mockResolvedValue(buildUser({ id: 'other-id' }));

      await expect(
        service.update('a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b', {
          email: 'ana@example.com',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('replaces the characters when every new id exists', async () => {
      const user = buildUser({ characterIds: [4, 10] });
      repository.findMissingCharacterIds.mockResolvedValue([]);
      repository.update.mockResolvedValue(user);

      await expect(
        service.update(user.id, { characterIds: [4, 10] }),
      ).resolves.toBe(user);
      expect(repository.findMissingCharacterIds).toHaveBeenCalledWith([4, 10]);
      expect(repository.update).toHaveBeenCalledWith(user.id, {
        characterIds: [4, 10],
      });
    });

    it('throws BadRequestException when a new character does not exist', async () => {
      repository.findMissingCharacterIds.mockResolvedValue([9999]);

      await expect(
        service.update('some-id', { characterIds: [9999] }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes the user', async () => {
      repository.remove.mockResolvedValue(true);

      await expect(service.remove('some-id')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.remove.mockResolvedValue(false);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
