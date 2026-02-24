import { Controller, Get } from '@nestjs/common';
import { HealthControllerDocs, HealthDocs } from './health.controller.docs';
import { ApiExcludeController } from '@nestjs/swagger';

@HealthControllerDocs()
@ApiExcludeController()
@Controller('core/health')
export class HealthController {
  @Get()
  @HealthDocs()
  health() {
    return { status: 'ok' };
  }
}
