import { UserRegisteredEventDto } from '@/modules/notification/application/dtos/user-registered.dto';
import { UserOtpRequestedEventDto } from '@/modules/notification/application/dtos/user-otp-requested.dto';
import { UserRegisteredEvent } from '@/modules/notification/domain/events/user-registered.event';
import { UserOtpRequestedEvent } from '@/modules/notification/domain/events/user-otp-requested.event';
import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthEventsController {
  private readonly logger = new Logger(AuthEventsController.name);
  constructor(private readonly eventBus: EventBus) {}
  @EventPattern('UserRegisteredEvent')
  async handleRegisteredEvent(
    @Payload() payload: UserRegisteredEventDto,
  ): Promise<void> {
    this.logger.log(`📩 Received UserRegistered event for: ${payload.email}`);
    await this.eventBus.publish(
      new UserRegisteredEvent(payload.aggregateId, payload.email, payload.otp),
    );
  }

  @EventPattern('UserOtpRequestedEvent')
  async handleOtpRequestedEvent(
    @Payload() payload: UserOtpRequestedEventDto,
  ): Promise<void> {
    this.logger.log(`📩 Received UserOtpRequested event for: ${payload.email}`);
    await this.eventBus.publish(
      new UserOtpRequestedEvent(
        payload.aggregateId,
        payload.email,
        payload.otp,
      ),
    );
  }
}
