// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string;
  roles: string[];
  iat: number; // Issued At
  exp: number; // Expiration Time
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // To fetch user details
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; roles: UserRole[]; isActive: boolean; firstName?: string; lastName?: string; }> {
    const userEntity = await this.usersService.findOne(payload.sub); // findOne already removes password
    if (!userEntity || !userEntity.isActive) {
      throw new UnauthorizedException('User not found or inactive, or token invalid.');
    }
    // Return a plain object that matches the expected structure for request.user
    return {
      id: userEntity.id,
      email: userEntity.email,
      roles: userEntity.roles,
      isActive: userEntity.isActive,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
    };
  }
}
