export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid notification email: ${email}`);
    this.name = 'InvalidEmailError';
  }
}
