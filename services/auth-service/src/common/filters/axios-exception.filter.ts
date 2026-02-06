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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      return reply.status(status).send(response);
    }

    if (isAxiosError(exception)) {
      if (exception.response) {
        return reply
          .status(exception.response.status)
          .send(exception.response.data ?? { message: 'Upstream error' });
      }

      return reply.status(HttpStatus.BAD_GATEWAY).send({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Service unavailable',
        error: 'Bad Gateway',
      });
    }

    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
