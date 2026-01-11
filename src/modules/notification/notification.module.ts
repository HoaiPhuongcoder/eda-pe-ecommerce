import { InfrastructureModule } from '@/infrastructure';
import { UserRegisteredEventHandler } from '@/modules/notification/application/handlers/user-registered-event.handler';
import { EMAIL_SENDER_PORT } from '@/modules/notification/application/ports/email-sender.port';
import { NOTIFICATION_QUEUE_PORT } from '@/modules/notification/application/ports/queue.port';
import { NOTIFICATION_QUEUE } from '@/modules/notification/domain/constants/queue-name.constant';
import { BullNotificationQueueAdapter } from '@/modules/notification/infrastructure/adapters/bullmq.adapter';
import { ResendEmailAdapter } from '@/modules/notification/infrastructure/adapters/resend-email.adapter';

import { NotificationProcessor } from '@/modules/notification/infrastructure/worker/bullmq-processor.woker';
import { AuthEventsController } from '@/modules/notification/presentation/event-consumers/auth-events.controller';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    InfrastructureModule,
    CqrsModule,
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
  ],
  controllers: [AuthEventsController],
  providers: [
    // Kafka Event Consumers
    UserRegisteredEventHandler,

    // BullMQ Processor
    NotificationProcessor,

    // Ports Implementation
    {
      provide: EMAIL_SENDER_PORT,
      useClass: ResendEmailAdapter,
    },
    {
      provide: NOTIFICATION_QUEUE_PORT,
      useClass: BullNotificationQueueAdapter,
    },
  ],
  exports: [NOTIFICATION_QUEUE_PORT],
})
export class NotificationModule {}
