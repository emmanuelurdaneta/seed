import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environment, EnvironmentVariables } from '../config/env.validation';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        type: 'postgres',
        host: config.get('DB_HOST', { infer: true }),
        port: config.get('DB_PORT', { infer: true }),
        username: config.get('DB_USERNAME', { infer: true }),
        password: config.get('DB_PASSWORD', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        autoLoadEntities: true,
        // Nunca sincronizar el esquema automáticamente en producción
        synchronize:
          config.get('DB_SYNCHRONIZE', { infer: true }) &&
          config.get('NODE_ENV', { infer: true }) !== Environment.Production,
      }),
    }),
  ],
})
export class DatabaseModule {}
