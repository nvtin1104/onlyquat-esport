import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, UserSchema, TournamentSchema, MatchSchema, TeamSchema } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EsportsController } from './esports.controller';
import { EsportsService } from './esports.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule, // Shared MongoDB connection
    // Import all schemas needed - including UserSchema for cross-collection queries
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Tournament', schema: TournamentSchema },
      { name: 'Match', schema: MatchSchema },
      { name: 'Team', schema: TeamSchema },
    ]),
  ],
  controllers: [EsportsController],
  providers: [EsportsService],
})
export class AppModule {}
