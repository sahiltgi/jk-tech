import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../users/dto/user-response.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<UserResponseDto>;
    login(user: UserResponseDto): Promise<any>;
    register(createUserDto: any): Promise<any>;
}
