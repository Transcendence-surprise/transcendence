import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email body (plain text)', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Email body (HTML)', required: false })
  @IsString()
  @IsOptional()
  html?: string;
}
