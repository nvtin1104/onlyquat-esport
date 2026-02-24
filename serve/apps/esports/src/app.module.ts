import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import { EsportsController } from './esports.controller';
import { EsportsService } from './esports.service';
import { RegionController } from './region/region.controller';
import { RegionService } from './region/region.service';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationService } from './organization/organization.service';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { TeamController } from './team/team.controller';
import { TeamService } from './team/team.service';
import { PlayerController } from './player/player.controller';
import { PlayerService } from './player/player.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [EsportsController, RegionController, OrganizationController, GameController, TeamController, PlayerController],
  providers: [EsportsService, RegionService, OrganizationService, GameService, TeamService, PlayerService],
})
export class AppModule {}
