import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

class UUIDPipe {
  transform(value: string) {
    if (!validateUUID(value)) {
      throw new BadRequestException('Invalid UUID');
    }
    return value;
  }
}
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity'; // Import User entity for type hinting

@ApiTags('Users')
@ApiBearerAuth() // Indicates that endpoints might require Bearer token authentication
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Automatically transform User entities to UserResponseDto
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. Email already exists.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.', type: [UserResponseDto] })
  // Add @Roles(UserRole.ADMIN) decorator here once auth is set up
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => new UserResponseDto(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details.', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  // Add @Roles(UserRole.ADMIN) or allow user to fetch their own profile
  async findOne(@Param('id', new UUIDPipe()) id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  // Add @Roles(UserRole.ADMIN) or allow user to update their own profile
  async update(@Param('id', new UUIDPipe()) id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  async remove(@Param('id', new UUIDPipe()) id: string) {
    await this.usersService.remove(id);
  }
}
