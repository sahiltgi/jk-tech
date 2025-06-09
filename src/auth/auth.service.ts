import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserRole } from '../users/user.roles'; // Assuming JwtPayload is defined in jwt.strategy.ts

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<UserResponseDto> {
    const userEntity = await this.usersService.findOneByEmailWithPassword(email);
    if (!userEntity) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(pass, userEntity.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!userEntity.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return new UserResponseDto(userEntity);
  }

  async login(user: UserResponseDto): Promise<any> {
    try {
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
      };

      const accessToken = this.jwtService.sign(payload);
      return {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        user
      };
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  async register(createUserDto: any): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      // Create user with default role
      const user = await this.usersService.create({
        ...createUserDto,
        roles: [UserRole.VIEWER]
      });

      // Generate JWT token
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
      };

      const accessToken = this.jwtService.sign(payload);
      return {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        user
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
