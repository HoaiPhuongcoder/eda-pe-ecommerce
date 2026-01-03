import { PrismaModule } from './database';
import { RedisModule } from './redis';
import { Module } from '@nestjs/common';
import { CryptoModule } from './security/crypto.module';

@Module({
  imports: [PrismaModule, RedisModule, CryptoModule],
  exports: [PrismaModule, RedisModule, CryptoModule],
})
export class InfrastructureModule {}
