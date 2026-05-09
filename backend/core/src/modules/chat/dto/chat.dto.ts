import { IsOptional, IsString, IsNotEmpty } from "class-validator";

export class AddChatMessageDto {

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  replyTo?: string;
}
