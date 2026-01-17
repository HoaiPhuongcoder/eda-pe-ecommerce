import { DomainEvent } from '@/shared';

export class UserOtpRequestedEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
  ) {
    super({ aggregateId: aggregateId });
  }
}
