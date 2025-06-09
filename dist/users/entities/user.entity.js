"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const user_roles_1 = require("../user.roles");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
exports.UserSchema = new mongoose_1.Schema({
    id: { type: String, required: true, default: uuid_1.v4 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(user_roles_1.UserRole), default: [user_roles_1.UserRole.VIEWER] },
    firstName: { type: String },
    lastName: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.UserSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = (0, uuid_1.v4)();
    }
    next();
});
exports.UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});
class User {
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map