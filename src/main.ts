import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('imac/api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useLogger(app.get(Logger));


  const config = new DocumentBuilder()
    .setTitle('IMAC')
    .setDescription('instituto matogrossense da carne')
    .addServer(process.env.URL_AMBIENTE as string, 'Local environment')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'api key apenas para webhook',
      },
      'api-key-header'
    )
    .addSecurityRequirements('bearer')
    .addTag('Imac')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });

  const server =  await app.listen(process.env.PORT ?? 3000);
  server.setTimeout(60000)
}

bootstrap();
