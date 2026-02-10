import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const HealthControllerDocs = () => ApiTags('API Gateway Health');

const HealthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'API Gateway health check',
      description: 'Check if the API Gateway is running and healthy',
      operationId: 'apiGatewayHealth',
    }),
    ApiResponse({
      status: 200,
      description: 'API Gateway is healthy',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    }),
  );

export { HealthControllerDocs, HealthDocs };
