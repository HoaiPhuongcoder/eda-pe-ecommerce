import { VerifyOtpCommand } from '@/modules/auth/application/commands/verify-otp.command';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '@/modules/auth/domain/repositories/auth-user.repository';
import { Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<void> {
    const { email, otp } = command;

    const user = await this.authUserRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = this.configService.getOrThrow<string>('OTP_SECRET');
    user.verifyOtp(otp, secret);

    await this.authUserRepository.save(user);
  }
}
