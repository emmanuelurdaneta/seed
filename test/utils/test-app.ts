import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../../src/app.setup';
import { DatabaseModule } from '../../src/database/database.module';
import { TEST_DATABASE } from './test-database';

// Reemplaza la conexión de la app: los tests siempre usan la base de prueba
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...TEST_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
class TestDatabaseModule {}

// Levanta la app completa conectada a la base de prueba, lista para supertest
export async function initTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideModule(DatabaseModule)
    .useModule(TestDatabaseModule)
    .compile();

  const app = moduleRef.createNestApplication({ logger: false });
  setupApp(app);
  await app.init();

  return app;
}
