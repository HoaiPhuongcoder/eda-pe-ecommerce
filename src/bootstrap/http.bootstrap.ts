// bootstrap/http.bootstrap.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function bootstrapHttp() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

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
