import { REDIS_CLIENT } from '@/infrastructure/redis/redis.constants';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export const RedisProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redis = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error', err);
    });

    return redis;
  },
};
