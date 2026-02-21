import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsToRpcFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://localhost:4223'],
      },
    },
  );
  app.useGlobalFilters(new AllExceptionsToRpcFilter());
  await app.listen();
  console.log('Core Service is running (NATS) - Auth + Users modules loaded');
}
bootstrap();
