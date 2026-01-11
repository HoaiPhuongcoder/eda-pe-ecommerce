import { NotificationEmail } from '@/modules/notification/domain/value-objects/notification-email.vo';
import { AggregateRoot } from '@nestjs/cqrs';

export enum NotificationType {
  OTP_EMAIL = 'OTP_EMAIL',
  WELCOME_EMAIL = 'WELCOME_EMAIL',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export class Notification extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly recipientEmail: NotificationEmail,
    public readonly type: NotificationType,
    public readonly payload: Record<string, any>,
    public status: NotificationStatus,
    public readonly createdAt: Date,
    public sentAt?: Date,
    public error?: string,
  ) {
    super();
  }

  markAsSent(): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(error: string): void {
    this.status = NotificationStatus.FAILED;
    this.error = error;
  }
}
