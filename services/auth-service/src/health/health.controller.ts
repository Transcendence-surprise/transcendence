import { Controller, Get } from '@nestjs/common';

@Controller('auth/health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}
