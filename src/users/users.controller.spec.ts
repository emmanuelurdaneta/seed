import { Test, TestingModule } from '@nestjs/testing';
import { UserWithCharactersDto } from './dto/user-with-characters.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const user: User = {
  id: 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b',
  name: 'Ana',
  email: 'ana@example.com',
  characterIds: [25],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it('POST /users delegates to the service', async () => {
    service.create.mockResolvedValue(user);
    const dto = { name: 'Ana', email: 'ana@example.com', characterIds: [25] };

    await expect(controller.create(dto)).resolves.toBe(user);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /users returns the list', async () => {
    service.findAll.mockResolvedValue([user]);

    await expect(controller.findAll()).resolves.toEqual([user]);
  });

  it('GET /users/:id returns the user with the character names', async () => {
    const userWithCharacters: UserWithCharactersDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      characters: ['Darth Vader'],
    };
    service.findOne.mockResolvedValue(userWithCharacters);

    await expect(controller.findOne(user.id)).resolves.toBe(userWithCharacters);
    expect(service.findOne).toHaveBeenCalledWith(user.id);
  });

  it('PATCH /users/:id delegates to the service', async () => {
    service.update.mockResolvedValue(user);

    await expect(controller.update(user.id, { name: 'Ana' })).resolves.toBe(
      user,
    );
    expect(service.update).toHaveBeenCalledWith(user.id, { name: 'Ana' });
  });

  it('DELETE /users/:id returns a confirmation message', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(user.id)).resolves.toEqual({
      message: `User with id ${user.id} deleted`,
    });
  });
});
