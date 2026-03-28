// all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.error('Caught exception:', exception); // <-- you will see the actual error

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // Use Fastify's reply API
    response.status(500).send({
      message: 'Internal error',
      name: exception?.name,
      details: exception?.response || exception?.message,
    });
  }
}