import { Match } from '@/shared';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 50)
  @IsStrongPassword()
  password: string;

  @IsString()
  @Length(8, 50)
  @IsStrongPassword()
  @Match('password')
  confirmPassword: string;
}

@Exclude()
export class RegisterUserResponseDto {
  @Expose()
  id: string;
  @Expose()
  email: string;

  password: string;

  @Expose()
  createAt: Date;
  @Expose()
  updateAt: Date;

  constructor(partial: Partial<RegisterUserResponseDto>) {
    Object.assign(this, partial);
  }
}
