import {
  NOTIFICATION_QUEUE_PORT,
  type NotificationQueuePort,
} from '@/modules/notification/application/ports/queue.port';
import { UserRegisteredEvent } from '@/modules/notification/domain/events/user-registered.event';
import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);

  constructor(
    @Inject(NOTIFICATION_QUEUE_PORT)
    private readonly notificationQueue: NotificationQueuePort,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`📨 Processing UserRegistered event for: ${event.email}`);

    try {
      // ✅ Add job to BullMQ instead of sending directly
      await this.notificationQueue.addOtpEmailJob(
        {
          email: event.email,
          otp: event.otp,
          userName: event.email.split('@')[0], // Extract username from email
        },
        1, // High priority for OTP
      );

      this.logger.log(`✅ OTP job queued for ${event.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to queue job for ${event.email}`, error);
      throw error;
    }
  }
}
