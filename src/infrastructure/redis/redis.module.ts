import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from '@/infrastructure/redis/redis.provider';

@Module({
  providers: [RedisProvider, RedisService],
})
export class RedisModule {}
