import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithCharactersDto } from './dto/user-with-characters.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const characterIds = createUserDto.characterIds ?? [];
    await this.ensureEmailIsFree(createUserDto.email);
    await this.ensureCharactersExist(characterIds);

    return this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      characterIds,
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<UserWithCharactersDto> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const { characterIds, ...userData } = user;
    const characters =
      await this.usersRepository.getCharacterNames(characterIds);
    return { ...userData, characters };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email !== undefined) {
      await this.ensureEmailIsFree(updateUserDto.email, id);
    }
    if (updateUserDto.characterIds !== undefined) {
      await this.ensureCharactersExist(updateUserDto.characterIds);
    }

    const user = await this.usersRepository.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const success = await this.usersRepository.remove(id);
    if (!success) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  private async ensureEmailIsFree(
    email: string,
    currentUserId?: string,
  ): Promise<void> {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing && existing.id !== currentUserId) {
      throw new ConflictException(`Email ${email} is already in use`);
    }
  }

  private async ensureCharactersExist(characterIds: number[]): Promise<void> {
    if (characterIds.length === 0) return;

    const missingIds =
      await this.usersRepository.findMissingCharacterIds(characterIds);
    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Character ids not found in SWAPI: ${missingIds.join(', ')}`,
      );
    }
  }
}
