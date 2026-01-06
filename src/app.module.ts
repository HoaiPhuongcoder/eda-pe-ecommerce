import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { SharedModule } from '@/shared';
import { InfrastructureModule } from '@/infrastructure';
import { UsersModule } from './modules/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    ScheduleModule.forRoot(),
    InfrastructureModule,
    SharedModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
