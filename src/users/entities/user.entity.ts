// src/users/entities/user.entity.ts
import { Schema, Document } from 'mongoose';
import { UserRole } from '../user.roles';
import * as bcrypt from 'bcrypt';

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

import { v4 as uuidv4 } from 'uuid';

export const UserSchema = new Schema({
  id: { type: String, required: true, default: uuidv4 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: Object.values(UserRole), default: [UserRole.VIEWER] },
  firstName: { type: String },
  lastName: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Add pre-save hook to ensure UUID is generated if not provided
UserSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  next();
});

// Add methods to the schema
// Add pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

export class User {
  id: string;
  email: string;
  password: string;
  roles: UserRole[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
