import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwapiClient } from '../clients/swapi.client';
import { StarWarsClient } from '../clients/star-wars.client';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    { provide: StarWarsClient, useClass: SwapiClient },
  ],
  exports: [UsersService],
})
export class UsersModule {}
