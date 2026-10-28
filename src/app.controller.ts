import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida' })
  @ApiOkResponse({ description: 'Saludo de la API', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Estado de la API' })
  @ApiOkResponse({
    description: 'La API está funcionando',
    schema: { example: { status: 'ok' } },
  })
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
