import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import type { FastifyReply } from 'fastify';

@Catch()
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    // If it's already a NestJS HttpException, handle it normally
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      return reply.status(status).send(response);
    }

    // If it's an Axios error from upstream service
    if (isAxiosError(exception)) {
      if (exception.response) {
        // Forward upstream service error with original status and body
        return reply
          .status(exception.response.status)
          .send(exception.response.data ?? { message: 'Upstream error' });
      }

      // Network/timeout errors → 502 Bad Gateway
      return reply.status(HttpStatus.BAD_GATEWAY).send({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Service unavailable',
        error: 'Bad Gateway',
      });
    }

    console.error('[AxiosExceptionFilter] Unexpected error:', exception);

    // Fallback for any other unexpected errors - preserve error details
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: errorStack }),
    });
  }
}
