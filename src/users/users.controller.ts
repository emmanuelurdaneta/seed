import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithCharactersDto } from './dto/user-with-characters.dto';
import { User } from './entities/user.entity';

const ID_PARAM = {
  name: 'id',
  description: 'Id del usuario (UUID)',
  example: 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b',
};

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Usuario creado', type: User })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o personajes inexistentes',
  })
  @ApiConflictResponse({ description: 'El email ya está en uso' })
  @ApiBadGatewayResponse({ description: 'SWAPI no está disponible' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios' })
  @ApiOkResponse({ description: 'Listado de usuarios', type: [User] })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene un usuario por id con los nombres de sus personajes',
  })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({
    description: 'Usuario encontrado',
    type: UserWithCharactersDto,
  })
  @ApiBadRequestResponse({ description: 'El id no es un UUID válido' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiBadGatewayResponse({ description: 'SWAPI no está disponible' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserWithCharactersDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza parcialmente un usuario' })
  @ApiParam(ID_PARAM)
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Usuario actualizado', type: User })
  @ApiBadRequestResponse({
    description: 'Datos de entrada o id inválidos, o personajes inexistentes',
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiConflictResponse({ description: 'El email ya está en uso' })
  @ApiBadGatewayResponse({ description: 'SWAPI no está disponible' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un usuario' })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({
    description: 'Usuario eliminado',
    schema: {
      example: { message: `User with id ${ID_PARAM.example} deleted` },
    },
  })
  @ApiBadRequestResponse({ description: 'El id no es un UUID válido' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: `User with id ${id} deleted` };
  }
}
