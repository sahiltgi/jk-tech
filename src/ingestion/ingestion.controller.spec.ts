import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DocumentStatus } from '../documents/enums/document-status.enum';
import { HttpException } from '@nestjs/common';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            triggerIngestion: jest.fn(),
            getIngestionStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const documentId = '123';
      const userId = '456';
      
      await controller.triggerIngestion(documentId, userId);
      
      expect(service.triggerIngestion).toHaveBeenCalledWith(documentId, userId);
    });
  });

  describe('getIngestionStatus', () => {
    it('should get ingestion status successfully', async () => {
      const documentId = '123';
      const status = DocumentStatus.PROCESSING;
      
      (service.getIngestionStatus as jest.Mock).mockResolvedValue({
        status,
        lastIngestedAt: new Date(),
      });
      
      const result = await controller.getIngestionStatus(documentId);
      
      expect(service.getIngestionStatus).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        status,
        lastIngestedAt: expect.any(Date),
      });
    });
  });
});
