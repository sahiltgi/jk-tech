import { AuthService } from '../auth.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';
declare const LocalStrategy_base: new (...args: any) => any;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, pass: string): Promise<UserResponseDto>;
}
export {};
