import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getModelToken } from '@nestjs/mongoose';
import { Document, DocumentDocument } from '../documents/schemas/document.schema';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DocumentStatus } from '../documents/enums/document-status.enum';
import { HttpException } from '@nestjs/common';

const mockDocument = {
  _id: '123',
  title: 'Test Document',
  content: 'Test content',
  status: DocumentStatus.PENDING,
  createdBy: '456',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('IngestionService', () => {
  let service: IngestionService;
  let documentModel: any;
  let userModel: any;
  let configService: any;
  let queue: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getModelToken('Document'),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: 'INGESTION_QUEUE',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    documentModel = module.get(getModelToken('Document'));
    userModel = module.get(getModelToken('User'));
    configService = module.get(ConfigService);
    queue = module.get('INGESTION_QUEUE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const documentId = '123';
      const userId = '456';
      
      (documentModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocument),
      });
      
      (documentModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockDocument, status: DocumentStatus.PROCESSING }),
      });
      
      await service.triggerIngestion(documentId, userId);
      
      expect(documentModel.findById).toHaveBeenCalledWith(documentId);
      expect(documentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        documentId,
        { status: DocumentStatus.PROCESSING },
        { new: true }
      );
      expect(queue.add).toHaveBeenCalledWith('document-ingestion', { documentId, userId });
    });

    it('should throw error for non-existent document', async () => {
      const documentId = '123';
      const userId = '456';
      
      (documentModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      
      await expect(service.triggerIngestion(documentId, userId))
        .rejects
        .toThrow('Document not found');
    });

    it('should throw error for unauthorized access', async () => {
      const documentId = '123';
      const userId = '789';
      
      (documentModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocument),
      });
      
      await expect(service.triggerIngestion(documentId, userId))
        .rejects
        .toThrow('Unauthorized: Document does not belong to user');
    });
  });
});
