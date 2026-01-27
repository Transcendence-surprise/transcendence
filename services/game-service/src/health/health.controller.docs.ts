import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const HealthControllerDocs = () => ApiTags('Game Health');

const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Game service health check',
      description: 'Check if the game service is running and healthy',
    }),
    ApiResponse({
      status: 200,
      description: 'Game service is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    }),
  );

export { HealthControllerDocs, HealthDocs };
