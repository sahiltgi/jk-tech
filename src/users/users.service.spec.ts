import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUser = {
  _id: '123',
  email: 'test@example.com',
  password: 'hashedpassword',
  roles: [UserRole.VIEWER],
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<Model<any>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockReturnThis(),
            find: jest.fn().mockImplementation(() => ({
              select: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([mockUser])
            })),
            findOne: jest.fn().mockImplementation(() => ({
              select: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockUser)
            })),
            findOneAndUpdate: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue({
                ...mockUser,
                toObject: jest.fn().mockReturnValue({
                  ...mockUser,
                  password: undefined
                })
              })
            })),
            findOneAndDelete: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(mockUser)
            })),
            save: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockUser),
            toObject: jest.fn().mockReturnValue({
              ...mockUser,
              password: undefined,
            }),
            select: jest.fn().mockReturnThis()
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('findAll', () => {
    it('should return all users', async () => {
      (userModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser])
      });

    });
  });


});
