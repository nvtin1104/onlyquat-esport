import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { AdminPermissionsController } from './admin/permissions.controller';
import { RegionsController } from './regions/regions.controller';
import { OrganizationsController } from './organizations/organizations.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PermissionsGuard } from './guards/permissions.guard';
import { RpcToHttpExceptionFilter } from './filters/rpc-exception.filter';
import { TranslateResponseInterceptor } from './interceptors/translate-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4223'],
        },
      },
      {
        name: 'ESPORTS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4223'],
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, UsersController, AdminPermissionsController, RegionsController, OrganizationsController],
  providers: [
    JwtStrategy,
    PermissionsGuard,
    {
      provide: APP_FILTER,
      useClass: RpcToHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslateResponseInterceptor,
    },
  ],
})
export class AppModule {}
