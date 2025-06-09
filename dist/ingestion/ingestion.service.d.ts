import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DocumentStatus } from '../documents/enums/document-status.enum';
export interface IngestionStatus {
    status: DocumentStatus;
    lastIngestedAt?: Date;
    error?: string;
}
export declare class IngestionService {
    private readonly documentModel;
    private readonly userModel;
    private readonly configService;
    private readonly queue;
    private readonly logger;
    private readonly maxRetries;
    constructor(documentModel: any, userModel: any, configService: ConfigService, queue: Queue);
    triggerIngestion(documentId: string, userId: string): Promise<void>;
    processDocument(documentId: string, userId: string): Promise<void>;
    getIngestionStatus(documentId: string): Promise<IngestionStatus>;
    retryIngestion(documentId: string, userId: string): Promise<void>;
    cancelIngestion(documentId: string, userId: string): Promise<void>;
}
