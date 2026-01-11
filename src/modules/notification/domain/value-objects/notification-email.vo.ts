import { InvalidEmailError } from '../errors/invalid-email.error';

export class NotificationEmail {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidEmailError(normalized);
    }
    this._value = normalized;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationEmail): boolean {
    return this._value === other._value;
  }
}
