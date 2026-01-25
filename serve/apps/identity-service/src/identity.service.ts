import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, CreateUserDto } from '@app/common';

@Injectable()
export class IdentityService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    // In production, hash the password using bcrypt
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email, password }).exec();
    // In production, compare hashed password
    return user;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
