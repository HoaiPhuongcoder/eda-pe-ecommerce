import {
  NOTIFICATION_QUEUE_PORT,
  type NotificationQueuePort,
} from '@/modules/notification/application/ports/queue.port';
import { UserOtpRequestedEvent } from '@/modules/notification/domain/events/user-otp-requested.event';
import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(UserOtpRequestedEvent)
export class UserOtpRequestedEventHandler implements IEventHandler<UserOtpRequestedEvent> {
  private readonly logger = new Logger(UserOtpRequestedEventHandler.name);

  constructor(
    @Inject(NOTIFICATION_QUEUE_PORT)
    private readonly notificationQueue: NotificationQueuePort,
  ) {}

  async handle(event: UserOtpRequestedEvent): Promise<void> {
    this.logger.log(`📨 Processing UserOtpRequested event for: ${event.email}`);

    try {
      // ✅ Add job to BullMQ - reuse same OTP email template
      await this.notificationQueue.addOtpEmailJob(
        {
          email: event.email,
          otp: event.otp,
          userName: event.email.split('@')[0], // Extract username from email
        },
        1, // High priority for OTP
      );

      this.logger.log(`✅ OTP resend job queued for ${event.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to queue job for ${event.email}`, error);
      throw error;
    }
  }
}
