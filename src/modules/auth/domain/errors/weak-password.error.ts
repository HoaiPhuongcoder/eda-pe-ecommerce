export class WeeKPasswordError extends Error {
  constructor() {
    super(
      'Weak password: Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.',
    );
  }
}
