import { OutboxStatus } from '@/generated/prisma/enums';
export interface IOutboxEvent {
  id: string;
  type: string;
  Payload: unknown;
  metadata: unknown;
  status: OutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOutboxRepository {
  findMany(args: any): Promise<IOutboxEvent[]>;
  update(args: any): Promise<IOutboxEvent>;
}
