import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ enum: ['player', 'organizer', 'admin'], default: 'player' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
