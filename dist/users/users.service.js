"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const { email, password, roles, firstName, lastName } = createUserDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = new this.userModel({
            email,
            password: await bcrypt.hash(password, 10),
            roles,
            firstName,
            lastName,
        });
        try {
            const savedUser = await user.save();
            const userObj = savedUser.toObject();
            delete userObj.password;
            return userObj;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error creating user');
        }
    }
    async findAll() {
        const users = await this.userModel.find().select('-password');
        return users.map(user => user.toObject());
    }
    async findOne(id) {
        const user = await this.userModel.findOne({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user.toObject();
    }
    async findOneByEmail(email) {
        return await this.userModel.findOne({ email });
    }
    async findOneByEmailWithPassword(email) {
        return await this.userModel.findOne({ email }).select(['id', 'email', 'password', 'roles', 'isActive']);
    }
    async update(id, updateUserDto) {
        const user = await this.userModel.findOneAndUpdate({ id }, updateUserDto, { new: true });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user.toObject();
    }
    async remove(id) {
        await this.userModel.findOneAndDelete({ id });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map