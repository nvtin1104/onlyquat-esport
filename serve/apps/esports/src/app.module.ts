import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import { EsportsController } from './esports.controller';
import { EsportsService } from './esports.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [EsportsController],
  providers: [EsportsService],
})
export class AppModule {}
