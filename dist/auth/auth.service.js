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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_response_dto_1 = require("../users/dto/user-response.dto");
const user_roles_1 = require("../users/user.roles");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const userEntity = await this.usersService.findOneByEmailWithPassword(email);
        if (!userEntity) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatch = await bcrypt.compare(pass, userEntity.password);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!userEntity.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        return new user_response_dto_1.UserResponseDto(userEntity);
    }
    async login(user) {
        try {
            const payload = {
                email: user.email,
                sub: user.id,
                roles: user.roles,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };
            const accessToken = this.jwtService.sign(payload);
            return {
                access_token: accessToken,
                token_type: 'bearer',
                expires_in: 3600,
                user
            };
        }
        catch (error) {
            throw new Error('Failed to generate JWT token');
        }
    }
    async register(createUserDto) {
        try {
            const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
            if (existingUser) {
                throw new common_1.BadRequestException('Email already registered');
            }
            const user = await this.usersService.create({
                ...createUserDto,
                roles: [user_roles_1.UserRole.VIEWER]
            });
            const payload = {
                email: user.email,
                sub: user.id,
                roles: user.roles,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };
            const accessToken = this.jwtService.sign(payload);
            return {
                access_token: accessToken,
                token_type: 'bearer',
                expires_in: 3600,
                user
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map