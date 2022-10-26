import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { urlencoded, json } from 'express';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { ConfigService } from '@nestjs/config';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  });
  const configService = app.get<ConfigService>(ConfigService);
  const host = new URL(process.env.NESTJS_HOST);
  const domain = host.hostname;

  // app.useLogger(app.get(Logger));
  // app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useWebSocketAdapter(new WsAdapter(app));
  const hasSubPath = process.env.SUB_PATH !== undefined;
  const UrlPrefix = hasSubPath ? process.env.SUB_PATH : '';

  // Exclude these endpoints from prefix. These endpoints are required for health checks.
  const pathsToExclude = [];
  if (hasSubPath) {
    pathsToExclude.push({ path: '/', method: RequestMethod.GET });
  }
  pathsToExclude.push({ path: '/health', method: RequestMethod.GET });
  pathsToExclude.push({ path: '/api/health', method: RequestMethod.GET });

  app.setGlobalPrefix(UrlPrefix + 'api', {
    exclude: pathsToExclude,
  });
  app.enableCors();
  app.use(compression());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb', parameterLimit: 1000000 }));

  const port = parseInt(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0', function () {
    const NestJShost = configService.get<string>('NESTJS_HOST');
    console.log(`Ready to use at ${NestJShost} 🚀`);
  });
}
bootstrap();
