import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const HealthControllerDocs = () => ApiTags('API Health');

const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Health check',
      description: 'Check if the core service is running and healthy',
      operationId: 'coreHealth',
    }),
    ApiResponse({
      status: 200,
      description: 'Core service is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    }),
  );

export { HealthControllerDocs, HealthDocs };
