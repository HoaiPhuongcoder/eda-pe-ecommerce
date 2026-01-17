import { ResendVerificationCodeCommand } from '@/modules/auth/application/commands/resend-verification-code.command';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '@/modules/auth/domain/repositories/auth-user.repository';
import {
  UserAlreadyVerifiedException,
  UserNotFoundException,
} from '@/modules/auth/domain/exceptions/auth.exception';
import { VerificationCode } from '@/modules/auth/domain/value-objects/verification-code.vo';
import { UserStatus } from '@/generated/prisma/enums';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ResendVerificationCodeCommand)
export class ResendVerificationCodeHandler implements ICommandHandler<ResendVerificationCodeCommand> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: ResendVerificationCodeCommand): Promise<void> {
    const { email } = command;

    const user = await this.authUserRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new UserAlreadyVerifiedException();
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UserAlreadyVerifiedException();
    }

    const secretKey = this.configService.getOrThrow<string>('OTP_SECRET');
    const verificationCode = VerificationCode.generate(secretKey);

    user.requestNewVerificationCode(verificationCode);

    await this.authUserRepository.save(user);
  }
}
