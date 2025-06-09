import { UserRole } from '../../common/enums/user-role.enum';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    roles?: UserRole[];
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
}
