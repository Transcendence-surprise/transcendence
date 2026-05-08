import { IsOptional, IsString } from "class-validator";

export class AddChatMessageDto {

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  replyTo?: string;
}
