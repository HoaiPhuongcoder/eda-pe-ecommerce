export class HashedPassword {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.length < 20) {
      throw new Error('Invalid hashed password');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }
}
