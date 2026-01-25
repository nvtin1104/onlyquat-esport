import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // NATS Client for communicating with microservices
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
  controllers: [AppController],
})
export class AppModule {}
