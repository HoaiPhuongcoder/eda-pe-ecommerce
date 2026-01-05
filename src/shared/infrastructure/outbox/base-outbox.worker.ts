import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export abstract class BaseOutboxWorker {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BATCH_SIZE = 50;
  constructor(
    protected readonly kafkaClient: ClientKafka,
    protected readonly prisma: PrismaService,
    protected readonly logger: Logger,
  ) {}
}
