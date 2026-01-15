import { DomainException } from '@/shared/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidOtpException extends DomainException {
  constructor() {
    super(`Invalid OTP`, HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotActiveException extends DomainException {
  constructor() {
    super(`User is not active`, HttpStatus.UNAUTHORIZED);
  }
}

export class UserBlockedException extends DomainException {
  constructor() {
    super(`User is blocked`, HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundException extends DomainException {
  constructor() {
    super(`User not found`, HttpStatus.NOT_FOUND);
  }
}

export class UserAlreadyVerifiedException extends DomainException {
  constructor() {
    super(`User is already verified`, HttpStatus.BAD_REQUEST);
  }
}
