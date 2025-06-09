"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const ingestion_controller_1 = require("./ingestion.controller");
const ingestion_service_1 = require("./ingestion.service");
const document_schema_1 = require("../documents/schemas/document.schema");
const user_entity_1 = require("../users/entities/user.entity");
const bullmq_1 = require("bullmq");
const mongoose_2 = require("@nestjs/mongoose");
let IngestionModule = class IngestionModule {
};
exports.IngestionModule = IngestionModule;
exports.IngestionModule = IngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            jwt_1.JwtModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'Document', schema: document_schema_1.DocumentSchema },
                { name: 'User', schema: user_entity_1.UserSchema }
            ])
        ],
        controllers: [ingestion_controller_1.IngestionController],
        providers: [
            {
                provide: 'DOCUMENT_MODEL',
                useFactory: (model) => model,
                inject: [(0, mongoose_2.getModelToken)('Document')]
            },
            {
                provide: 'USER_MODEL',
                useFactory: (model) => model,
                inject: [(0, mongoose_2.getModelToken)('User')]
            },
            {
                provide: 'INGESTION_QUEUE',
                useFactory: async (configService) => {
                    return new bullmq_1.Queue('document-ingestion', {
                        connection: {
                            host: 'redis',
                            port: 6379
                        }
                    });
                },
                inject: [config_1.ConfigService]
            },
            ingestion_service_1.IngestionService,
            {
                provide: 'INGESTION_WORKER',
                useFactory: async (configService, ingestionService) => {
                    const queue = new bullmq_1.Queue('document-ingestion', {
                        connection: {
                            host: 'redis',
                            port: 6379
                        }
                    });
                    return new bullmq_1.Worker('document-ingestion', async (job) => {
                        const { documentId, userId } = job.data;
                        return await ingestionService.processDocument(documentId, userId);
                    }, {
                        connection: {
                            host: 'redis',
                            port: 6379
                        },
                        concurrency: 1,
                        limiter: {
                            max: 10,
                            duration: 1000
                        }
                    });
                },
                inject: [config_1.ConfigService, ingestion_service_1.IngestionService]
            }
        ]
    })
], IngestionModule);
//# sourceMappingURL=ingestion.module.js.map