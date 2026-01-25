import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  tag?: string; // Team tag/abbreviation

  @Prop()
  logo?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  players: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  captainId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  coachId?: Types.ObjectId;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  losses: number;

  @Prop({ default: 0 })
  draws: number;

  @Prop()
  country?: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
