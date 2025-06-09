import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';
export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        roles: UserRole[];
        isActive: boolean;
        firstName?: string;
        lastName?: string;
    }>;
}
export {};
