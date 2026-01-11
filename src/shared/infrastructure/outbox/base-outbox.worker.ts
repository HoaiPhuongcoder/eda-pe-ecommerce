import { OutboxStatus } from '@/generated/prisma/enums';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { IOutboxRepository } from '@/shared/infrastructure/outbox/outbox.interface';
import { Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface OutboxPayload {
  id?: string;
  userId?: string;
  [key: string]: unknown;
}

export abstract class BaseOutboxWorker {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BATCH_SIZE = 50;
  constructor(
    protected readonly kafkaClient: ClientKafka,
    protected readonly prisma: PrismaService,
    protected readonly logger: Logger,
  ) {}

  protected async processOutbox(modelName: string) {
    const repository = this.prisma[modelName] as IOutboxRepository;
    const records = await repository.findMany({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.PENDING] },
        attempts: { lt: this.MAX_ATTEMPTS },
      },
      take: this.BATCH_SIZE,
      orderBy: { id: 'asc' },
    });

    if (records.length === 0) return;
    this.logger.log(`[${modelName}] Processing ${records.length} events...`);
    for (const record of records) {
      try {
        // 2. Chuyển sang trạng thái đang xử lý (Tránh worker khác bốc trùng)
        await repository.update({
          where: { id: record.id },
          data: { status: OutboxStatus.PROCESSING },
        });

        const payload = record.payload as OutboxPayload;

        const kafkaKey = payload.id || payload.userId || record.id;

        // 3. Gửi lên Kafka (Emit)
        await firstValueFrom(
          this.kafkaClient.emit(record.type, {
            key: kafkaKey,
            value: {
              ...payload,
            },
          }),
        );

        // 4. Đánh dấu hoàn thành
        await repository.update({
          where: { id: record.id },
          data: {
            status: OutboxStatus.COMPLETED,
            processedAt: new Date(),
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(
            `[${modelName}] Lỗi gửi event ${record.id}: ${error}`,
          );
          const nextAttempts = record.attempts + 1;
          await repository.update({
            where: { id: record.id },
            data: {
              attempts: nextAttempts,
              lastError: error.message,
              status:
                nextAttempts >= 5 ? OutboxStatus.FAILED : OutboxStatus.PENDING,
            },
          });
        }
      }
    }
  }
}
