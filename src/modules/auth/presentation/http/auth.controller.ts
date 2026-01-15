import { RegisterUserCommand } from '@/modules/auth/application/commands/register-user.command';
import { VerifyOtpCommand } from '@/modules/auth/application/commands/verify-otp.command';
import { RegisterUserDto } from '@/modules/auth/application/dtos/register-user.dto';
import { VerifyOtpDto } from '@/modules/auth/application/dtos/verify-otp.dto';
import { ResponseMessage } from '@/shared';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}
  @ResponseMessage('User registered successfully')
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    await this.commandBus.execute(
      new RegisterUserCommand(registerDto.email, registerDto.password),
    );
  }
  @ResponseMessage('User verified successfully')
  @Post('verify')
  async verify(@Body() verifyDto: VerifyOtpDto) {
    await this.commandBus.execute(
      new VerifyOtpCommand(verifyDto.email, verifyDto.otp),
    );
  }
}
