import { RegisterUserCommand } from '@/modules/auth/application/commands/register-user.command';
import {
  ROLE_READER_PORT,
  type RoleReaderPort,
} from '@/modules/auth/application/ports/role-reader.port';
import { AuthUser } from '@/modules/auth/domain/aggregates/auth-user-aggregate';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '@/modules/auth/domain/repositories/auth-user.repository';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';
import { HashedPassword } from '@/modules/auth/domain/value-objects/hash-password.vo';
import { RawPassword } from '@/modules/auth/domain/value-objects/raw-password.vo';
import { PASSWORD_HASHER, type PasswordHasher } from '@/shared';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(ROLE_READER_PORT) private readonly roleReaderPort: RoleReaderPort,
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
  ) {}
  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, password } = command;

    const emailVO = new Email(email);
    const rawPassword = new RawPassword(password);
    const hashedPassword = await this.passwordHasher.hash(rawPassword.value);
    const hashedPasswordVO = HashedPassword.fromHash(hashedPassword);
    const roleId = await this.roleReaderPort.getClientRoleId();
    if (!roleId) {
      throw new InternalServerErrorException('Default role not found');
    }

    const user = AuthUser.register(emailVO, hashedPasswordVO, roleId);

    await this.authUserRepository.save(user);

    user.commit();
  }
}
