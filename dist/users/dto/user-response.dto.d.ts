import { UserRole } from '../../common/enums/user-role.enum';
export declare class UserResponseDto {
    id: string;
    email: string;
    roles: UserRole[];
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<UserResponseDto>);
    password?: string;
}
