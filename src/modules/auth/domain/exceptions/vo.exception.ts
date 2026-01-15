import { DomainException } from '@/shared/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Invalid email ${email}`, HttpStatus.BAD_REQUEST);
  }
}

export class WeakPasswordException extends DomainException {
  constructor() {
    super(`Weak password`, HttpStatus.BAD_REQUEST);
  }
}
