import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfigModule, ThrottlerConfig } from '@/config';
import { SharedModule } from '@/shared';
import { InfrastructureModule } from '@/infrastructure';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [
    AppConfigModule,
    ThrottlerConfig,
    InfrastructureModule,
    SharedModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
