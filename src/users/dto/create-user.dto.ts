import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
    format: 'email',
    maxLength: 150,
  })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({
    description: 'Ids de personajes de SWAPI (sin repetir, máximo 20)',
    example: [1, 4, 10],
    type: [Number],
    required: false,
    maxItems: 20,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  characterIds?: number[];
}
