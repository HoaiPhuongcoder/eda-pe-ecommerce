import databaseConfig from './database.config';
import redisConfig from './redis.config';

export const allConfigs = [redisConfig, databaseConfig];

export { redisConfig, databaseConfig };
