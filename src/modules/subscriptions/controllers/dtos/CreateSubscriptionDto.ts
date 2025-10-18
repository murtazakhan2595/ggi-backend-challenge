import { IsEnum, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';
import { SubscriptionTier, BillingCycle } from '../../domain/entities/Subscription';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(SubscriptionTier)
  @IsNotEmpty()
  tier: SubscriptionTier;

  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @IsBoolean()
  autoRenew: boolean = true;
}