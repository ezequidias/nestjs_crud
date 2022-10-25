import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  });
  const configService = app.get<ConfigService>(ConfigService);
  const host = new URL(process.env.NESTJS_HOST);
  const domain = host.hostname;

  app.enableCors();

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb', parameterLimit: 1000000 }));

  const port = parseInt(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0', function () {
    const NestJShost = configService.get<string>('NESTJS_HOST');
    console.log(`Ready to use at ${NestJShost} 🚀`);
  });
}
bootstrap();
