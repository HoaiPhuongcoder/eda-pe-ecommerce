import { PrismaModule } from '@/infrastructure/database/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({ imports: [PrismaModule], exports: [PrismaModule] })
export class InfrastructureModule {}
