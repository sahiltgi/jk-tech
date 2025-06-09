import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
export type UserDocument = User & Document;
export declare class User {
    email: string;
    password: string;
    roles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
