import { redisConfig } from '@/config';
import { REDIS_CLIENT } from '@/infrastructure/redis/redis.constants';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
export const RedisProvider = {
  provide: REDIS_CLIENT,
  inject: [redisConfig.KEY],
  useFactory: (config: ConfigType<typeof redisConfig>) => {
    const redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
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
