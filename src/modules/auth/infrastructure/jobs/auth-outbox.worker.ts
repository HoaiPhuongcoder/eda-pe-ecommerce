import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { KAFKA_SERVICE } from '@/infrastructure/kafka/kafka.module';
import { BaseOutboxWorker } from '@/shared/infrastructure/outbox/base-outbox.worker';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthOutboxWorker
  extends BaseOutboxWorker
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(KAFKA_SERVICE) kafkaClient: ClientKafka,
    prisma: PrismaService,
  ) {
    super(kafkaClient, prisma, new Logger(AuthOutboxWorker.name));
  }
  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka connected in Auth Worker');
    } catch (error) {
      this.logger.error('Kafka connection failed in Auth Worker', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.kafkaClient.close();
      this.logger.log('Kafka disconnected in Auth Worker');
    } catch (error) {
      this.logger.error('Kafka disconnection failed in Auth Worker', error);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleOutbox() {
    await this.processOutbox('IntegrationEventOutbox');
  }
}
