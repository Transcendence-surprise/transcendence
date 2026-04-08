// all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('Caught exception:', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      response.status(status).send({
        statusCode: status,
        ...this.sanitizeHttpExceptionResponse(responseBody),
      });

      return;
    }

    const isDevelopment = process.env.NODE_ENV === 'development';

    response.status(500).send({
      statusCode: 500,
      message: 'Internal server error',
      ...(isDevelopment ? this.getDevelopmentDetails(exception) : {}),
    });
  }

  private sanitizeHttpExceptionResponse(response: string | object) {
    if (typeof response === 'string') {
      return { message: response };
    }

    if (!response || typeof response !== 'object') {
      return { message: 'Request failed' };
    }

    const safeResponse = response as Record<string, unknown>;
    const sanitizedResponse: Record<string, unknown> = {};

    if ('message' in safeResponse) {
      sanitizedResponse.message = safeResponse.message;
    }

    if ('error' in safeResponse) {
      sanitizedResponse.error = safeResponse.error;
    }

    return sanitizedResponse;
  }

  private getDevelopmentDetails(exception: unknown) {
    if (exception instanceof Error) {
      return {
        error: {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        },
      };
    }

    return { error: exception };
  }
}