// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@$$wOrd123',
    description: 'The password for the user (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: [UserRole.VIEWER, UserRole.EDITOR],
    description: 'Roles assigned to the user',
    enum: UserRole,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({ example: 'John', description: 'First name of the user', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
}
