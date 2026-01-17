import { BaseEventDto } from '@/shared/dtos/base-event.dto';
import { IsString, IsEmail } from 'class-validator';

export class UserOtpRequestedEventDto extends BaseEventDto {
  @IsString()
  otp: string;

  @IsEmail()
  email: string;

  @IsString()
  aggregateId: string;
}
