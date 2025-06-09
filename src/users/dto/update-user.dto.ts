// src/users/dto/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'updated.user@example.com', description: 'The email of the user' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewP@$$wOrd123',
    description: 'The new password for the user (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: [UserRole.EDITOR],
    description: 'Roles assigned to the user',
    enum: UserRole,
    isArray: true,
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  roles?: UserRole[];

  @ApiPropertyOptional({ example: 'Johnathan', description: 'First name of the user' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doer', description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the user account is active' })
  @IsOptional()
  isActive?: boolean;
}
