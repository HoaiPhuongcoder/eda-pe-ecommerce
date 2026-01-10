import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { SharedModule } from '@/shared';
import { InfrastructureModule } from '@/infrastructure';
import { UsersModule } from './modules/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './modules/notification/notification.module';
import { BullMQConfig } from '@/infrastructure/queue/bull-mq.config';
@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    BullMQConfig,
    ScheduleModule.forRoot(),
    InfrastructureModule,
    SharedModule,
    AuthModule,
    UsersModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
