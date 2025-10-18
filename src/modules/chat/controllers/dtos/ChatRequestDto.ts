import { IsString, IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class ChatRequestDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  question: string;
}