import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { RoleReaderPort } from '@/modules/auth/application/ports/role-reader.port';
import { RoleName } from '@/modules/auth/domain/enums/role-name.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaRoleReader implements RoleReaderPort {
  constructor(private readonly prisma: PrismaService) {}

  async getClientRoleId(): Promise<number> {
    const role = await this.prisma.role.findUnique({
      where: { name: RoleName.Client },
      select: { id: true, isActive: true },
    });

    if (!role?.isActive) {
      throw new Error('Default USER role is missing or inactive');
    }

    return role.id;
  }
}
