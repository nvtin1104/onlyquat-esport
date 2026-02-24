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
import { TeamHistoryController } from './team/team-history.controller';
import { TeamHistoryService } from './team/team-history.service';
import { PlayerController } from './player/player.controller';
import { PlayerService } from './player/player.service';
import { PlayerHistoryController } from './player/player-history.controller';
import { PlayerHistoryService } from './player/player-history.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [EsportsController, RegionController, OrganizationController, GameController, TeamController, TeamHistoryController, PlayerController, PlayerHistoryController],
  providers: [EsportsService, RegionService, OrganizationService, GameService, TeamService, TeamHistoryService, PlayerService, PlayerHistoryService],
})
export class AppModule {}
