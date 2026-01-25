import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team' })
  team1Id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team' })
  team2Id?: Types.ObjectId;

  @Prop({ required: true })
  scheduledTime: Date;

  @Prop({ enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  refereeId?: Types.ObjectId;

  @Prop({ type: Object })
  score?: {
    team1: number;
    team2: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'Team' })
  winnerId?: Types.ObjectId;

  @Prop()
  duration?: number; // in minutes

  @Prop()
  streamUrl?: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
