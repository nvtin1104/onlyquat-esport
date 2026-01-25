import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TournamentDocument = Tournament & Document;

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  game: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizerId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }], default: [] })
  teams: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Match' }], default: [] })
  matches: Types.ObjectId[];

  @Prop({ default: 0 })
  prizePool: number;

  @Prop()
  rules?: string;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
