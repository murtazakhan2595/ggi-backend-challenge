import { IsUUID, IsNotEmpty } from 'class-validator';

export class ToggleAutoRenewDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
