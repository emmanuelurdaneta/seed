import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('GET / returns the greeting', () => {
    expect(appController.getHello()).toBe('Hello from NestJS!');
  });

  it('GET /health returns ok status', () => {
    expect(appController.getHealth()).toEqual({ status: 'ok' });
  });
});
