import { allConfigs } from '@/config/app/namespaces';
import { validateEnvironment } from '@/config/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: allConfigs,
      validate: validateEnvironment,
      envFilePath: ['.env'],
      ignoreEnvFile:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'test',
    }),
  ],
})
export class AppConfigModule {}
