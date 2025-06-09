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
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const document_status_enum_1 = require("../documents/enums/document-status.enum");
let IngestionService = IngestionService_1 = class IngestionService {
    constructor(documentModel, userModel, configService, queue) {
        this.documentModel = documentModel;
        this.userModel = userModel;
        this.configService = configService;
        this.queue = queue;
        this.logger = new common_1.Logger(IngestionService_1.name);
        this.maxRetries = 3;
    }
    async triggerIngestion(documentId, userId) {
        try {
            const document = await this.documentModel.findById(documentId)
                .populate('createdBy', 'email roles')
                .exec();
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (document.createdBy._id.toString() !== userId) {
                throw new common_1.HttpException('Unauthorized: Document does not belong to user', common_1.HttpStatus.UNAUTHORIZED);
            }
            const updatedDoc = await this.documentModel.findByIdAndUpdate(documentId, { status: document_status_enum_1.DocumentStatus.PROCESSING }, { new: true }).exec();
            if (!updatedDoc) {
                throw new common_1.HttpException('Failed to update document status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            await this.queue.add('process-document', {
                documentId,
                userId
            }, {
                attempts: this.maxRetries,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            });
            this.logger.log(`Ingestion triggered for document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger ingestion: ${error.message}`);
            try {
                await this.documentModel.findByIdAndUpdate(documentId, {
                    status: document_status_enum_1.DocumentStatus.FAILED,
                    error: error.message
                }).exec();
            }
            catch (updateError) {
                this.logger.error(`Failed to update document status after error: ${updateError.message}`);
            }
            throw error;
        }
    }
    async processDocument(documentId, userId) {
        try {
            const document = await this.documentModel.findById(documentId).exec();
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (document.status === document_status_enum_1.DocumentStatus.PROCESSING) {
                throw new common_1.HttpException('Document is already being processed', common_1.HttpStatus.CONFLICT);
            }
            await this.documentModel.findByIdAndUpdate(documentId, { status: document_status_enum_1.DocumentStatus.PROCESSING }, { new: true }).exec();
            await new Promise(resolve => setTimeout(resolve, 5000));
            const updatedDoc = await this.documentModel.findByIdAndUpdate(documentId, {
                status: document_status_enum_1.DocumentStatus.COMPLETED,
                lastIngestedAt: new Date(),
                error: null
            }, { new: true }).exec();
            if (!updatedDoc) {
                throw new common_1.HttpException('Failed to update document status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            this.logger.log(`Document ${documentId} processed successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to process document ${documentId}: ${error.message}`);
            try {
                await this.documentModel.findByIdAndUpdate(documentId, {
                    status: document_status_enum_1.DocumentStatus.FAILED,
                    error: error.message
                }, { new: true }).exec();
            }
            catch (updateError) {
                this.logger.error(`Failed to update document status after processing error: ${updateError.message}`);
            }
            throw error;
        }
    }
    async getIngestionStatus(documentId) {
        const document = await this.documentModel.findById(documentId).exec();
        if (!document) {
            throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            status: document.status,
            lastIngestedAt: document.lastIngestedAt,
            error: document.error || undefined
        };
    }
    async retryIngestion(documentId, userId) {
        try {
            const document = await this.documentModel.findById(documentId)
                .populate('createdBy', 'email roles')
                .exec();
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (document.createdBy._id.toString() !== userId) {
                throw new common_1.HttpException('Unauthorized: Document does not belong to user', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (document.status !== document_status_enum_1.DocumentStatus.FAILED) {
                throw new common_1.HttpException('Document can only be retried if it has failed', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.triggerIngestion(documentId, userId);
        }
        catch (error) {
            this.logger.error(`Failed to retry ingestion: ${error.message}`);
            throw error;
        }
    }
    async cancelIngestion(documentId, userId) {
        try {
            const document = await this.documentModel.findById(documentId)
                .populate('createdBy', 'email roles')
                .exec();
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (document.createdBy._id.toString() !== userId) {
                throw new common_1.HttpException('Unauthorized: Document does not belong to user', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (document.status !== document_status_enum_1.DocumentStatus.PROCESSING) {
                throw new common_1.HttpException('Only processing documents can be cancelled', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.documentModel.findByIdAndUpdate(documentId, {
                status: document_status_enum_1.DocumentStatus.FAILED,
                error: 'Cancelled by user'
            }, { new: true }).exec();
            this.logger.log(`Ingestion cancelled for document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel ingestion: ${error.message}`);
            throw error;
        }
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DOCUMENT_MODEL')),
    __param(1, (0, common_1.Inject)('USER_MODEL')),
    __param(3, (0, common_1.Inject)('INGESTION_QUEUE')),
    __metadata("design:paramtypes", [Object, Object, config_1.ConfigService,
        bullmq_1.Queue])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map