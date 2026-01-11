import { BaseEventDto } from '@/shared/dtos/base-event.dto';
import { IsString, IsEmail } from 'class-validator';

// 1. Tạo Class cho cái ruột "props" trước ex
export class UserRegisteredEventDto extends BaseEventDto {
  @IsString()
  otp: string;

  @IsEmail()
  email: string;

  @IsString()
  aggregateId: string;
}

// 2. Tạo Class cho cái vỏ ngoài (Cái này mới dùng trong Controller)
