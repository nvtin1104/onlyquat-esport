import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import { EsportsController } from './esports.controller';
import { EsportsService } from './esports.service';
import { RegionController } from './region/region.controller';
import { RegionService } from './region/region.service';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationService } from './organization/organization.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [EsportsController, RegionController, OrganizationController],
  providers: [EsportsService, RegionService, OrganizationService],
})
export class AppModule {}
