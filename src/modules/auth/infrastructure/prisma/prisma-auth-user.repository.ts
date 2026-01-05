import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { AuthUser } from '@/modules/auth/domain/aggregates/auth-user-aggregate';
import { AuthUserRepository } from '@/modules/auth/domain/repositories/auth-user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async save(user: AuthUser): Promise<void> {
    await this.prismaService.user.create({
      data: {
        email: user.email.value,
        password: user.password.value,
        status: user.status,
        roleId: user.roleId,
      },
    });
  }
}
