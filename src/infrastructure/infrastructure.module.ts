import { PrismaModule } from '@/infrastructure/database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
