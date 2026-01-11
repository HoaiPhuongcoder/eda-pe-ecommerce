import { UserStatus } from '@/modules/auth/domain/enums/user-status.enum';
import { UserRegisteredEvent } from '@/modules/auth/domain/events/user-registered.event';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';
import { HashedPassword } from '@/modules/auth/domain/value-objects/hash-password.vo';
import { VerificationCode } from '@/modules/auth/domain/value-objects/verification-code.vo';
import { AggregateRoot } from '@nestjs/cqrs';
import { v7 } from 'uuid';

export class AuthUser extends AggregateRoot {
  private constructor(
    private _id: string,
    private _email: Email,
    private _password: HashedPassword,
    private _roleId: number,
    private _status: UserStatus,
    private _verificationCode?: VerificationCode,
  ) {
    super();
  }
  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): HashedPassword {
    return this._password;
  }

  get status(): UserStatus {
    return this._status;
  }
  get roleId(): number {
    return this._roleId;
  }

  get verificationCode(): VerificationCode | undefined {
    return this._verificationCode;
  }

  static register(
    email: Email,
    password: HashedPassword,
    roleId: number,
    verificationCode: VerificationCode,
  ): AuthUser {
    const id = v7();
    const user = new AuthUser(
      id,
      email,
      password,
      roleId,
      UserStatus.INACTIVE,
      verificationCode,
    );

    user.apply(
      new UserRegisteredEvent(user.id, user.email.value, verificationCode.code),
    );
    return user;
  }

  canLogin(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  inactivate(): void {
    this._status = UserStatus.INACTIVE;
  }

  block(): void {
    this._status = UserStatus.BLOCKED;
  }
  activate(): void {
    this._status = UserStatus.ACTIVE;
  }

  assignId(id: string): void {
    if (this._id) {
      throw new Error('User ID already assigned');
    }
    this._id = id;
  }
}
