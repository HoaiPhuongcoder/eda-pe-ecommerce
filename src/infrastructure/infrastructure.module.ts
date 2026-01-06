import { PrismaModule } from './database';
import { RedisModule } from './redis';
import { Module } from '@nestjs/common';
import { CryptoModule } from './security/crypto.module';
import { KafkaModule } from '@/infrastructure/kafka/kafka.module';

@Module({
  imports: [PrismaModule, RedisModule, CryptoModule, KafkaModule],
  exports: [PrismaModule, RedisModule, CryptoModule, KafkaModule],
})
export class InfrastructureModule {}
