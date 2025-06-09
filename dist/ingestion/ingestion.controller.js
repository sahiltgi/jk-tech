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
exports.IngestionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ingestion_service_1 = require("./ingestion.service");
let IngestionController = class IngestionController {
    constructor(ingestionService) {
        this.ingestionService = ingestionService;
    }
    async triggerIngestion(documentId, req) {
        await this.ingestionService.triggerIngestion(documentId, req.user.id);
        return { message: 'Ingestion triggered successfully' };
    }
    async getIngestionStatus(documentId) {
        return this.ingestionService.getIngestionStatus(documentId);
    }
    async getAllTasks() {
        return {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0
        };
    }
};
exports.IngestionController = IngestionController;
__decorate([
    (0, common_1.Post)(':documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger document ingestion' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ingestion triggered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Unauthorized access' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "triggerIngestion", null);
__decorate([
    (0, common_1.Get)(':documentId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ingestion status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ingestion status returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "getIngestionStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ingestion tasks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of ingestion tasks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "getAllTasks", null);
exports.IngestionController = IngestionController = __decorate([
    (0, swagger_1.ApiTags)('ingestion'),
    (0, common_1.Controller)('ingestion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ingestion_service_1.IngestionService])
], IngestionController);
//# sourceMappingURL=ingestion.controller.js.map