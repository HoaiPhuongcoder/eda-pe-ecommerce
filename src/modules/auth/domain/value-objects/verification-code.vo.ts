import { createHmac } from 'crypto';

export class VerificationCode {
  constructor(
    public readonly code: string,
    public readonly expired: Date,
  ) {}

  static generate(secret: string | undefined = undefined, ttlMinutes = 5) {
    const plainCode = this.generateNumericCode(6);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const hashedCode = this.hashCode(plainCode, secret);
    return new VerificationCode(hashedCode, expiresAt);
  }

  private static generateNumericCode(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      '',
    );
  }

  private static hashCode(
    code: string,
    secret: string | undefined = undefined,
  ): string {
    return createHmac('sha256', secret!).update(code).digest('hex');
  }

  verifyCode(
    inputCode: string,
    secret: string | undefined = undefined,
  ): boolean {
    const hashedInputCode = VerificationCode.hashCode(inputCode, secret);
    const isNotExpired = !this.isExpired();
    return this.code === hashedInputCode && isNotExpired;
  }

  private isExpired(): boolean {
    return new Date() > this.expired;
  }

  get expiredAt(): Date {
    return this.expired;
  }

  get value(): string {
    return this.code;
  }
}
