// src/users/dto/user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Added ApiPropertyOptional
import { UserRole } from '../../common/enums/user-role.enum';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Unique identifier of the user' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address of the user' })
  email: string;

  @ApiProperty({ example: ['viewer', 'editor'], enum: UserRole, isArray: true, description: 'Roles of the user' })
  roles: UserRole[];

  @ApiPropertyOptional({ example: 'John', description: 'First name of the user' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  lastName?: string;

  @ApiProperty({ example: true, description: 'Whether the user account is active' })
  isActive: boolean;

  @ApiProperty({ example: '2025-06-08T10:45:30.000Z', description: 'Date and time when the user was created' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-08T10:45:30.000Z', description: 'Date and time when the user was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Exclude() // This ensures password is never part of this DTO when transforming
  password?: string; 
}
