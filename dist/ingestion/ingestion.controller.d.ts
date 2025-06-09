import { IngestionService, IngestionStatus } from './ingestion.service';
export declare class IngestionController {
    private readonly ingestionService;
    constructor(ingestionService: IngestionService);
    triggerIngestion(documentId: string, req: any): Promise<{
        message: string;
    }>;
    getIngestionStatus(documentId: string): Promise<IngestionStatus>;
    getAllTasks(): Promise<{
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    }>;
}
