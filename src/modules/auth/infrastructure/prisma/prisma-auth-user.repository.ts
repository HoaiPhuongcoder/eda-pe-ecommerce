import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { AuthUser } from '@/modules/auth/domain/aggregates/auth-user-aggregate';
import { AuthUserRepository } from '@/modules/auth/domain/repositories/auth-user.repository';
import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(authUser: AuthUser): Promise<void> {
    const domainEvents = authUser.getUncommittedEvents();

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: authUser.id || undefined,
          email: authUser.email.value,
          password: authUser.password.value,
          status: authUser.status,
          roleId: authUser.roleId,
        },
      });

      for (const event of domainEvents) {
        const { ...payload } = event;
        await tx.integrationEventOutbox.create({
          data: {
            type: event.constructor.name,
            payload: payload,
            metadata: {
              traceId: uuidv7(),
              source: 'auth-module',
              version: '1.0',
            },
            status: 'PENDING',
          },
        });
      }
    });
    authUser.commit();
  }
}
