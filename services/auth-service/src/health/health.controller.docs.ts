import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const HealthControllerDocs = () => ApiTags('Auth Health');

const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Auth service health check',
      description: 'Check if the auth service is running and healthy',
      operationId: 'authHealth',
    }),
    ApiResponse({
      status: 200,
      description: 'Auth service is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    }),
  );

export { HealthControllerDocs, HealthDocs };
