import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailResDto } from './dto/send-mail-res.dto';
import { MailControllerDocs, SendMailDocs } from './mail.controller.docs';

@MailControllerDocs()
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @SendMailDocs()
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<SendMailResDto> {
    return this.mailService.sendMail(sendMailDto);
  }
}
