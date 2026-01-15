import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return {
      service: 'auth-service',
      version: '1.0.0',
      status: 'running',
    };
  }
}
