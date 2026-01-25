import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@app/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule, // Shared MongoDB connection
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class AppModule {}
