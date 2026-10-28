import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserWithCharactersDto extends OmitType(User, [
  'characterIds',
] as const) {
  @ApiProperty({
    description: 'Nombres de los personajes del usuario, obtenidos de SWAPI',
    example: ['Luke Skywalker', 'Darth Vader', 'Obi-Wan Kenobi'],
    type: [String],
  })
  characters: string[];
}
