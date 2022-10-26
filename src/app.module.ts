import { Module, OnModuleInit, MiddlewareConsumer } from '@nestjs/common';

import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '../ormconfig';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';

import { AppConfigModule } from './modules/app_config/app_config.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [`./.env.${process.env.NODE_ENV}`, './.env'],
  }),
  TypeOrmModule.forRoot(ormconfig),
  AppConfigModule,
  AuthModule,
  UsersModule
];
@Module({
  imports,
  controllers: [AppController],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private connection: Connection) { }

  // configure(consumer: MiddlewareConsumer): void {
  //   consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
  //     path: '*',
  //     method: RequestMethod.ALL,
  //   });
  // }

  onModuleInit(): void {
    console.log(`Version: ${globalThis.TOOLJET_VERSION}`);
    console.log(`Initializing server modules 📡 `);
  }
}
