import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  MockReply,
  networkError,
  notFound,
  ok,
  serverError,
} from '../../test/utils/axios-responses';
import { EnvironmentVariables } from '../config/env.validation';
import { SwapiClient } from './swapi.client';

const BASE_URL = 'https://swapi.test/api';

// Spy de axios.get: el mock aplica cuando la URL pedida CONTIENE su path (endpoint + parámetros).
// Un GET sin mock falla, así ningún test sale a internet.
const mockAxiosGet = (routes: Record<string, MockReply>) =>
  jest.spyOn(axios, 'get').mockImplementation(((url: string) => {
    const path = Object.keys(routes).find((route) => url.includes(route));
    return path
      ? routes[path](url)
      : Promise.reject(new Error(`No axios.get mock for ${url}`));
  }) as typeof axios.get);

describe('SwapiClient', () => {
  let client: SwapiClient;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue(BASE_URL),
    } as unknown as ConfigService<EnvironmentVariables, true>;
    client = new SwapiClient(configService);
    jest.spyOn(client['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCharacterNames', () => {
    it('returns the names in the same order as the ids', async () => {
      const getSpy = mockAxiosGet({
        '/people/4/': ok({ name: 'Darth Vader' }),
        '/people/1/': ok({ name: 'Luke Skywalker' }),
      });

      await expect(client.getCharacterNames([4, 1])).resolves.toEqual([
        'Darth Vader',
        'Luke Skywalker',
      ]);
      expect(getSpy).toHaveBeenCalledWith(`${BASE_URL}/people/4/`, {
        timeout: 5000,
      });
    });

    it('returns an empty list without calling the API', async () => {
      const getSpy = mockAxiosGet({});

      await expect(client.getCharacterNames([])).resolves.toEqual([]);
      expect(getSpy).not.toHaveBeenCalled();
    });

    it('throws BadGatewayException when a character is not found', async () => {
      mockAxiosGet({ '/people/9999/': notFound() });

      await expect(client.getCharacterNames([9999])).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('throws BadGatewayException when the API returns a server error', async () => {
      mockAxiosGet({ '/people/1/': serverError() });

      await expect(client.getCharacterNames([1])).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('throws BadGatewayException when the request fails', async () => {
      mockAxiosGet({ '/people/1/': networkError() });

      await expect(client.getCharacterNames([1])).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('findMissingCharacterIds', () => {
    it('returns only the ids that the API does not know', async () => {
      mockAxiosGet({
        '/people/1/': ok({ name: 'Luke Skywalker' }),
        '/people/9999/': notFound(),
      });

      await expect(client.findMissingCharacterIds([1, 9999])).resolves.toEqual([
        9999,
      ]);
    });
  });
});
