import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from '@/infrastructure/redis/redis.provider';
import { ConfigModule } from '@nestjs/config';
import { redisConfig } from '@/config';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [RedisProvider, RedisService],
})
export class RedisModule {}
