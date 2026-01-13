import { OutboxStatus, VerificationCodeType } from '@/generated/prisma/enums';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { AuthUser } from '@/modules/auth/domain/aggregates/auth-user-aggregate';
import { MODULE_NAME } from '@/modules/auth/domain/enums/auth-constant';
import { UserStatus } from '@/modules/auth/domain/enums/user-status.enum';
import { AuthUserRepository } from '@/modules/auth/domain/repositories/auth-user.repository';
import { ConflictException, Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(authUser: AuthUser): Promise<void> {
    const domainEvents = authUser.getUncommittedEvents();
    const verificationCode = authUser.verificationCode;

    await this.prismaService.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: authUser.email.value },
      });

      if (existingUser) {
        if (
          existingUser.status === UserStatus.ACTIVE ||
          existingUser.status === UserStatus.BLOCKED
        ) {
          throw new ConflictException('Email is already registered');
        }
        // Nếu là INACTIVE -> Update ghi đè
        await tx.user.update({
          where: { email: authUser.email.value },
          data: {
            password: authUser.password.value,
          },
        });
      } else {
        await tx.user.create({
          data: {
            id: authUser.id,
            email: authUser.email.value,
            password: authUser.password.value,
            status: authUser.status,
            roleId: authUser.roleId,
          },
        });
      }

      if (verificationCode) {
        await tx.verificationCode.upsert({
          where: {
            email_type: {
              email: authUser.email.value,
              type: VerificationCodeType.REGISTER,
            },
          },
          update: {
            code: authUser.verificationCode.hash,
            expiresAt: authUser.verificationCode.expiredAt,
            attempts: 0,
          },
          create: {
            email: authUser.email.value,
            type: VerificationCodeType.REGISTER,
            code: authUser.verificationCode.hash,
            expiresAt: authUser.verificationCode.expiredAt,
            attempts: 0,
          },
        });
      }

      for (const event of domainEvents) {
        const { ...payload } = event;
        await tx.integrationEventOutbox.create({
          data: {
            type: event.constructor.name,
            payload: payload,
            metadata: {
              traceId: uuidv7(),
              source: MODULE_NAME,
              aggregateId: authUser.id,
            },
            status: OutboxStatus.PENDING,
          },
        });
      }
    });
    authUser.commit();
  }
}
