import { UserStatus } from '@/modules/auth/domain/enums/user-status.enum';
import { UserRegisteredEvent } from '@/modules/auth/domain/events/user-created.event';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';
import { HashedPassword } from '@/modules/auth/domain/value-objects/hash-password.vo';
import { AggregateRoot } from '@nestjs/cqrs';
import { v7 } from 'uuid';

export class AuthUser extends AggregateRoot {
  private constructor(
    private _id: string | null,
    private _email: Email,
    private _password: HashedPassword,
    private _roleId: number,
    private _status: UserStatus,
  ) {
    super();
  }
  get id(): string | null {
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

  static register(
    email: Email,
    password: HashedPassword,
    roleId: number,
  ): AuthUser {
    const id = v7();
    const user = new AuthUser(id, email, password, roleId, UserStatus.INACTIVE);

    user.apply(new UserRegisteredEvent(email.value, id));
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
