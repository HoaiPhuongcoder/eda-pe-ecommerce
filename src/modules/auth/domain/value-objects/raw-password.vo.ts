import { WeeKPasswordError } from '../errors/weak-password.error';

export class RawPassword {
  private readonly _value: string;

  constructor(value: string) {
    if (!RawPassword.isValidPassword(value)) {
      throw new WeeKPasswordError();
    }
    this._value = value;
  }
  get value(): string {
    return this._value;
  }

  private static isValidPassword(password: string): boolean {
    // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
