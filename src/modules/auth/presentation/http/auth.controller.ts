import { RegisterUserCommand } from '@/modules/auth/application/commands/register-user.command';
import { RegisterUserDto } from '@/modules/auth/application/dtos/register-user.dto';
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
}
