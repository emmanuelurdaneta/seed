import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Identificador del usuario',
    example: 'a3b8f1c2-4d5e-4f60-8a7b-9c0d1e2f3a4b',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  @Column({ length: 150, unique: true })
  email: string;

  @ApiProperty({
    description: 'Ids de los personajes del usuario (ids de SWAPI)',
    example: [1, 4, 10],
    type: [Number],
  })
  @Column('int', { name: 'character_ids', array: true, default: () => "'{}'" })
  characterIds: number[];

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-15T10:30:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
