import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StarWarsClient } from '../clients/star-wars.client';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

const user: User = {
  id: 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b',
  name: 'Ana',
  email: 'ana@example.com',
  characterIds: [1, 25],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let typeormRepository: { findOneBy: jest.Mock };
  let starWarsClient: jest.Mocked<StarWarsClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: { findOneBy: jest.fn() },
        },
        {
          provide: StarWarsClient,
          useValue: {
            getCharacterNames: jest.fn(),
            findMissingCharacterIds: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get(UsersRepository);
    typeormRepository = module.get(getRepositoryToken(User));
    starWarsClient = module.get(StarWarsClient);
  });

  describe('findOne', () => {
    it('returns the stored user with its character ids, without calling the API', async () => {
      typeormRepository.findOneBy.mockResolvedValue(user);

      await expect(repository.findOne(user.id)).resolves.toBe(user);
      expect(typeormRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(starWarsClient.getCharacterNames).not.toHaveBeenCalled();
    });

    it('returns null when the user does not exist', async () => {
      typeormRepository.findOneBy.mockResolvedValue(null);

      await expect(repository.findOne('missing')).resolves.toBeNull();
    });
  });

  it('delegates the character names lookup to the client', async () => {
    starWarsClient.getCharacterNames.mockResolvedValue([
      'Luke Skywalker',
      'Darth Vader',
    ]);

    await expect(repository.getCharacterNames([1, 4])).resolves.toEqual([
      'Luke Skywalker',
      'Darth Vader',
    ]);
    expect(starWarsClient.getCharacterNames).toHaveBeenCalledWith([1, 4]);
  });

  it('delegates the character id check to the client', async () => {
    starWarsClient.findMissingCharacterIds.mockResolvedValue([99999]);

    await expect(
      repository.findMissingCharacterIds([1, 99999]),
    ).resolves.toEqual([99999]);
  });
});
