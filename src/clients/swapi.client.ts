import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EnvironmentVariables } from '../config/env.validation';
import { StarWarsClient } from './star-wars.client';

interface SwapiPerson {
  name: string;
}

const REQUEST_TIMEOUT_MS = 5000;

@Injectable()
export class SwapiClient extends StarWarsClient {
  private readonly logger = new Logger(SwapiClient.name);
  private readonly baseUrl: string;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    super();
    this.baseUrl = configService.get('SWAPI_BASE_URL', { infer: true });
  }

  // Falla con 502 si SWAPI no responde o no encuentra alguno.
  async getCharacterNames(ids: number[]): Promise<string[]> {
    const people = await Promise.all(ids.map((id) => this.getPerson(id)));

    return people.map((person, index) => {
      if (!person) {
        throw new BadGatewayException(
          `SWAPI did not return character with id ${ids[index]}`,
        );
      }
      return person.name;
    });
  }

  async findMissingCharacterIds(ids: number[]): Promise<number[]> {
    const people = await Promise.all(ids.map((id) => this.getPerson(id)));
    return ids.filter((_, index) => people[index] === null);
  }

  private async getPerson(id: number): Promise<SwapiPerson | null> {
    const url = `${this.baseUrl}/people/${id}/`;

    try {
      const { data } = await axios.get<SwapiPerson>(url, {
        timeout: REQUEST_TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      // axios lanza error con cualquier status fuera de 2xx; 404 = el personaje no existe
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Request to ${url} failed`, error);
      throw new BadGatewayException('SWAPI is not available');
    }
  }
}
