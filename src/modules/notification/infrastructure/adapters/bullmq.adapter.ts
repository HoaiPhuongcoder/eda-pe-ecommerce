import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NotificationQueuePort,
  SendOtpEmailJob,
} from '@/modules/notification/application/ports/queue.port';
import {
  NOTIFICATION_QUEUE,
  NotificationJobName,
} from '@/modules/notification/domain/constants/queue-name.constant';

@Injectable()
export class BullNotificationQueueAdapter implements NotificationQueuePort {
  private readonly logger = new Logger(BullNotificationQueueAdapter.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
  ) {}

  async addOtpEmailJob(
    data: SendOtpEmailJob,
    priority: number = 1,
  ): Promise<void> {
    try {
      await this.notificationQueue.add(
        NotificationJobName.SEND_OTP_EMAIL,
        data,
        {
          priority, // Higher priority = processed first
          attempts: 5, // Override default: retry 5 times for OTP
          backoff: {
            type: 'exponential',
            delay: 1000, // Start with 1s delay
          },
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600, // Keep failed jobs for 24h
          },
        },
      );

      this.logger.log(`📬 Added OTP email job to queue for: ${data.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to add job to queue', error);
      throw error;
    }
  }

  async addWelcomeEmailJob(data: {
    email: string;
    userName: string;
  }): Promise<void> {
    try {
      await this.notificationQueue.add(
        NotificationJobName.SEND_WELCOME_EMAIL,
        data,
        {
          priority: 5, // Lower priority than OTP
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s delay
          },
        },
      );

      this.logger.log(`📬 Added welcome email job to queue for: ${data.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to add welcome job to queue', error);
      throw error;
    }
  }
}
