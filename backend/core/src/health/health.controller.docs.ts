import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const HealthControllerDocs = () => ApiTags('API Health');

const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Health check',
      description: 'Check if the service is running and healthy',
      operationId: 'coreHealth',
    }),
    ApiResponse({
      status: 200,
      description: 'Service is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    }),
  );

export { HealthControllerDocs, HealthDocs };
