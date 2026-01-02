import { InvalidEmailError } from '../errors/invalid-email.error';

export class Email {
  private readonly _value: string;
  constructor(value: string) {
    const normalizedEmail = value.trim().toLowerCase();
    if (!Email.isValidEmail(normalizedEmail)) {
      throw new InvalidEmailError(normalizedEmail);
    }
    this._value = normalizedEmail;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
