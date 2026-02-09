import { Controller, Get } from '@nestjs/common';
import { HealthControllerDocs, HealthDocs } from './health.controller.docs';

@HealthControllerDocs()
@Controller('health')
export class HealthController {
  @Get()
  @HealthDocs()
  health() {
    return { status: 'ok' };
  }
}
