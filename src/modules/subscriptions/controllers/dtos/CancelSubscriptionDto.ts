import { IsUUID, IsNotEmpty } from 'class-validator';

export class CancelSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}