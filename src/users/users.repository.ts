import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StarWarsClient } from '../clients/star-wars.client';
import { User } from './entities/user.entity';

type UserData = Pick<User, 'name' | 'email' | 'characterIds'>;

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private starWarsClient: StarWarsClient,
  ) {}

  create(data: UserData): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'ASC' } });
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  getCharacterNames(characterIds: number[]): Promise<string[]> {
    return this.starWarsClient.getCharacterNames(characterIds);
  }

  findMissingCharacterIds(characterIds: number[]): Promise<number[]> {
    return this.starWarsClient.findMissingCharacterIds(characterIds);
  }

  async update(id: string, changes: Partial<UserData>): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) return null;

    if (changes.name !== undefined) user.name = changes.name;
    if (changes.email !== undefined) user.email = changes.email;
    if (changes.characterIds !== undefined) {
      user.characterIds = changes.characterIds;
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
