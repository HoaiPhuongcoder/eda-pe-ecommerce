import { DomainEvent } from '@/shared';

export class UserOtpRequestedEvent extends DomainEvent {
  constructor(
    public readonly props: { aggregateId: string; email: string; otp: string },
  ) {
    super({ aggregateId: props.aggregateId });
  }
}
