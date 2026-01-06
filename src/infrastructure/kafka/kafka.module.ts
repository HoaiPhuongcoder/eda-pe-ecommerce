import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

// src/infrastructure/kafka/kafka.module.ts
export const KAFKA_SERVICE = Symbol('KAFKA_SERVICE');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'pe_market_producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          producer: {
            createPartitioner: Partitioners.DefaultPartitioner,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
