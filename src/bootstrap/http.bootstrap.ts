// bootstrap/http.bootstrap.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrapHttp() {
  const app = await NestFactory.create(AppModule);

  // Config Kafka Lib
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'pe_market_ecommerce',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        retry: {
          initialRetryTime: 300,
          retries: 10,
        },
      },
      consumer: {
        groupId: 'pe_market_ecommerce_group',
        allowedNodeEnvironmentFlags: true,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  // Config Lib
  // -------------------------------------------------------------------------------------------
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // Config Pipe, Mid, Interceptor, Guard Global
  // -------------------------------------------------------------------------------------------
  const reflector = app.get(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const formattedErrors = validationErrors.map((error) => ({
          field: error.property,
          message: Object.values(
            error.constraints as Record<string, string>,
          ).join(),
        }));
        return new BadRequestException({
          statusCode: 400,
          messages: formattedErrors,
          error: 'Bad Request',
        });
      },
    }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.enableShutdownHooks();

  // Config Swagger ----------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('PE_MARKET_ECOMMERCE')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addTag('PEE')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 pe_market_ecommerce running on port ${port}`);
}
