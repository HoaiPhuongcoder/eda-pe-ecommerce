import { createHmac, randomInt } from 'crypto';

export class VerificationCode {
  constructor(
    private readonly _code: string,
    private readonly _hashCode: string,
    public readonly _expired: Date,
  ) {}

  static generate(secret: string, ttlMinutes = 5) {
    if (!secret) {
      throw new Error('OTP Secret is required to generate Verification Code');
    }
    const plainCode = this.generateNumericCode(6);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const hashedCode = this.hashCode(plainCode, secret);
    return new VerificationCode(plainCode, hashedCode, expiresAt);
  }

  private static generateNumericCode(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += randomInt(0, 10).toString();
    }
    return result;
  }

  private static hashCode(code: string, secret: string): string {
    return createHmac('sha256', secret).update(code).digest('hex');
  }

  verifyCode(inputCode: string, secret: string): boolean {
    const hashedInputCode = VerificationCode.hashCode(inputCode, secret);
    const isNotExpired = !this.isExpired();
    return this._hashCode === hashedInputCode && isNotExpired;
  }

  private isExpired(): boolean {
    return new Date() > this._expired;
  }

  get code(): string {
    return this._code;
  }

  get expiredAt(): Date {
    return this._expired;
  }
  get hash(): string {
    return this._hashCode;
  }
}
