import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, roles, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = new this.userModel({
      email,
      password: await bcrypt.hash(password, 10),
      roles,
      firstName,
      lastName,
    });

    try {
      const savedUser = await user.save();
      // Convert Mongoose document to plain object and remove password
      const userObj = savedUser.toObject();
      delete userObj.password;
      return userObj;
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().select('-password');
    return users.map(user => user.toObject());
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.toObject();
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    // This method is often used for authentication, so it might need to return the password.
    // Handle with care and ensure it's only used internally by the AuthService.
    return await this.userModel.findOne({ email });
  }

  async findOneByEmailWithPassword(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email }).select(['id', 'email', 'password', 'roles', 'isActive']); 
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOneAndUpdate({ id }, updateUserDto, { new: true });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.toObject();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findOneAndDelete({ id });
  }
}
