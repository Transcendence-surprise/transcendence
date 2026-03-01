import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiExcludeController,
} from '@nestjs/swagger';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailResDto } from './dto/send-mail-res.dto';

const MailControllerDocs = () =>
  applyDecorators(
    ApiExcludeController(),
    ApiTags('Mail')
  );

const SendMailDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Send email',
      description: 'Send an email to a recipient with subject and body (text or HTML)',
      operationId: 'sendMail',
    }),
    ApiBody({
      description: 'Email data to send',
      type: SendMailDto,
    }),
    ApiOkResponse({
      description: 'Email sent successfully',
      type: SendMailResDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request - Invalid email data' }),
  );

export { MailControllerDocs, SendMailDocs };
