import { ApiProperty } from '@nestjs/swagger';

export class SendMailResDto {
  @ApiProperty({ description: 'Whether email was sent successfully' })
  success: boolean;

  @ApiProperty({ description: 'Message ID from the mail server', required: false })
  messageId?: string;
}
