import { Schema, Document } from 'mongoose';
import { UserRole } from '../user.roles';
export type UserDocument = Document & {
    id: string;
    email: string;
    password: string;
    roles: UserRole[];
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    validatePassword(password: string): Promise<boolean>;
};
export declare const UserSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    id: string;
    email: string;
    password: string;
    roles: string[];
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}, Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    id: string;
    email: string;
    password: string;
    roles: string[];
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}>, {}> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    id: string;
    email: string;
    password: string;
    roles: string[];
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class User {
    id: string;
    email: string;
    password: string;
    roles: UserRole[];
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    validatePassword(password: string): Promise<boolean>;
}
