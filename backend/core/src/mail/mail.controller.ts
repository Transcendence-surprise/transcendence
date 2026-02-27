import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailResDto } from './dto/send-mail-res.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    type: SendMailResDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid email data',
  })
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<SendMailResDto> {
    return this.mailService.sendMail(sendMailDto);
  }
}
