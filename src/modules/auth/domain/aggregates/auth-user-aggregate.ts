import { UserStatus } from '@/generated/prisma/enums';
import { InvalidOtpException } from '@/modules/auth/domain/exceptions/auth.exception';

import { UserRegisteredEvent } from '@/modules/auth/domain/events/user-registered.event';
import { UserVerifiedEvent } from '@/modules/auth/domain/events/user-verified.event';
import { UserOtpRequestedEvent } from '@/modules/auth/domain/events/user-otp-requested.event';
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

  static restore(
    id: string,
    email: Email,
    password: HashedPassword,
    roleId: number,
    status: UserStatus,
    verificationCode?: VerificationCode,
  ): AuthUser {
    return new AuthUser(id, email, password, roleId, status, verificationCode);
  }

  verifyOtp(code: string, secret: string): void {
    if (!this._verificationCode) {
      throw new InvalidOtpException();
    }

    if (!this._verificationCode.verifyCode(code, secret)) {
      throw new InvalidOtpException();
    }

    this.activate();
    this._verificationCode = undefined;
    this.apply(new UserVerifiedEvent(this.id, this.email.value));
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

  requestNewVerificationCode(verificationCode: VerificationCode): void {
    if (this._status !== UserStatus.INACTIVE) {
      throw new Error(
        'Can only request new verification code for inactive users',
      );
    }

    this._verificationCode = verificationCode;
    this.apply(
      new UserOtpRequestedEvent(
        this.id,
        this.email.value,
        verificationCode.code,
      ),
    );
  }

  assignId(id: string): void {
    if (this._id) {
      throw new Error('User ID already assigned');
    }
    this._id = id;
  }
}
