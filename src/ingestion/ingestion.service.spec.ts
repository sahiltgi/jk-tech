import { Test, TestingModule } from '@nestjs/testing';
import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Document, DocumentDocument, IDocument, DocumentClass } from '../documents/schemas/document.schema';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DocumentStatus } from '../documents/enums/document-status.enum';
import { getModelToken } from '@nestjs/mongoose';
import { IngestionService } from './ingestion.service';
import { expect } from '@jest/globals';

const mockDocument = {
  _id: new Types.ObjectId('64842863b2f54e001d000001'),
  userId: new Types.ObjectId('64842863b2f54e001d000002'),
  status: DocumentStatus.PROCESSING,
  createdAt: new Date(),
  updatedAt: new Date(),
  title: 'Test Document',
  content: 'Test content',
  createdBy: new Types.ObjectId('64842863b2f54e001d000002'),
  sharedWith: [],
  metadata: {
    size: 1024,
    contentType: 'application/pdf',
    keywords: ['test', 'document']
  },
  lastIngestedAt: new Date(),
  isPublic: false,
  type: 'pdf',
  tags: [],
  version: 1,
  sourceUrl: 'http://example.com/document.pdf',
  thumbnail: 'http://example.com/thumbnail.jpg',
  customFields: [],
  metadataFields: [],
  __v: 0,
  $assertPopulated: jest.fn(),
  $clearModifiedPaths: jest.fn(),
  $clone: jest.fn(),
  $createModifiedPathsSnapshot: jest.fn(),
  $delete: jest.fn(),
  $deleteOne: jest.fn(),
  $get: jest.fn(),
  $init: jest.fn(),
  $isDeleted: jest.fn(),
  $isDefault: jest.fn(),
  $isModified: jest.fn(),
  $isValid: jest.fn(),
  $markModified: jest.fn(),
  $model: jest.fn(),
  $save: jest.fn(),
  $set: jest.fn(),
  $toObject: jest.fn(),
  $toJSON: jest.fn(),
  $validate: jest.fn(),
  $where: jest.fn(),
  $isPopulated: jest.fn(),
  $populate: jest.fn(),
  $session: jest.fn(),
  $isNew: false,
  $locals: {},
  $op: null,
  $wasPopulated: false,
  $version: 0,
  $isSubdocument: false,
  $isMongooseDocumentArray: false,
  $isSingleNested: false,
  $isMongooseArray: false,
  $isMongooseDocument: true,
  $isMongooseObject: false,
  $isMongooseBuffer: false,
  $isMongooseNumber: false,
  $isMongooseString: false,
  $isMongooseBoolean: false,
  $isMongooseDate: false,
  $isMongooseMixed: false,
  $isMongooseSchemaType: false,
  $isMongooseSchema: false,
  $isMongooseModel: false,
  $isMongooseDocumentArrayElement: false,
  $isMongooseDocumentArrayElementInstance: false,
  $isMongooseDocumentArrayElementPrototype: false
} as any as IDocument;

describe('IngestionService', () => {
  let service: IngestionService;
  let documentModel: any;
  let userModel: any;
  let configService: any;
  let queue: any;
  let logger: any;

  beforeEach(async () => {
    logger = {
      log: jest.fn(),
      error: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IngestionService,
          useValue: {
            logger,
            triggerIngestion: jest.fn().mockResolvedValue(undefined),
            processDocument: jest.fn().mockResolvedValue(undefined),
            getIngestionStatus: jest.fn().mockResolvedValue(undefined),
            retryIngestion: jest.fn().mockResolvedValue(undefined),
            cancelIngestion: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: 'DOCUMENT_MODEL',
          useValue: {
            findById: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: 'USER_MODEL',
          useValue: {
            findById: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis(),
            exec: jest.fn(),
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
    documentModel = module.get('DOCUMENT_MODEL');
    userModel = module.get('USER_MODEL');
    configService = module.get(ConfigService);
    queue = module.get('INGESTION_QUEUE');

    // Mock implementations
    (documentModel.findById as jest.Mock).mockReturnThis();
    (documentModel.findOne as jest.Mock).mockReturnThis();
    (documentModel.findByIdAndUpdate as jest.Mock).mockReturnThis();
    (documentModel.populate as jest.Mock).mockReturnThis();
    (documentModel.exec as jest.Mock).mockImplementation(() => Promise.resolve(mockDocument));
    (userModel.findById as jest.Mock).mockReturnThis();
    (userModel.findOne as jest.Mock).mockReturnThis();
    (userModel.exec as jest.Mock).mockImplementation(() => Promise.resolve({ _id: '456', email: 'test@example.com', roles: [] }));
    (queue.add as jest.Mock).mockResolvedValue({ jobId: '123' });


  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerIngestion', () => {
    it('should throw error for unauthorized access', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.triggerIngestion('123', '456')
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when document not found', async () => {
      (documentModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.triggerIngestion('123', '456')
      ).rejects.toThrow('Document not found');
    });

    it('should throw error when document status update fails', async () => {
      (documentModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(
        service.triggerIngestion('123', '456')
      ).rejects.toThrow('Failed to update document status');
    });

    it('should successfully trigger ingestion', async () => {
      await service.triggerIngestion('123', '456');
      expect(queue.add).toHaveBeenCalledWith(
        'process-document',
        { documentId: '123', userId: '456' },
        expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({
            type: 'exponential',
            delay: 1000
          })
        })
      );
    });
  });

  describe('processDocument', () => {
    it('should update document status to COMPLETED after processing', async () => {
      jest.setTimeout(10000); // Increase timeout for this test
      await service.processDocument('123', '456');
      expect(documentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          status: DocumentStatus.COMPLETED,
          lastIngestedAt: expect.any(Date),
          error: null
        }),
        { new: true }
      );
    });

    it('should log error when document processing fails', async () => {
      const mockError = new Error('Processing failed');
      (documentModel.findByIdAndUpdate as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });

      // Mock the logger error method
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      try {
        await service.processDocument('123', '456');
      } catch (error) {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to process document')
        );
      }
    });

    it('should retry ingestion successfully', async () => {
      const mockFailedDocument = {
        ...mockDocument,
        status: DocumentStatus.FAILED
      };
      (documentModel.findById as jest.Mock).mockImplementationOnce(() => {
        return { 
          exec: jest.fn().mockResolvedValue(mockDocument),
          populate: jest.fn().mockReturnThis()
        };
      });
      (documentModel.findByIdAndUpdate as jest.Mock).mockImplementationOnce(() => {
        return { exec: jest.fn().mockResolvedValue(mockDocument) };
      });

      await service.retryIngestion('123', '456');
      expect(queue.add).toHaveBeenCalledWith(
        'process-document',
        { documentId: '123', userId: '456' },
        expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({
            type: 'exponential',
            delay: 1000
          })
        })
      );
    });

    it('should cancel ingestion successfully', async () => {
      const mockDoc = {
        ...mockDocument,
        status: DocumentStatus.PROCESSING
      };
      (documentModel.findById as jest.Mock).mockImplementationOnce(() => {
        return { 
          exec: jest.fn().mockResolvedValue(mockDoc),
          populate: jest.fn().mockReturnThis()
        };
      });

      await service.cancelIngestion('123', '456');
      expect(documentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { status: DocumentStatus.FAILED },
        { new: true }
      );
    });

    it('should throw error when trying to cancel non-processing document', async () => {
      const mockDoc = {
        ...mockDocument,
        status: DocumentStatus.PENDING
      };
      (documentModel.findById as jest.Mock).mockImplementationOnce(() => {
        return { 
          exec: jest.fn().mockResolvedValue(mockDoc),
          populate: jest.fn().mockReturnThis()
        };
      });

      await expect(service.cancelIngestion('123', '456'))
        .rejects.toThrow('Document is not in processing state');
    });

    it('should throw error when trying to retry non-failed document', async () => {
      const mockDoc = {
        ...mockDocument,
        status: DocumentStatus.PENDING
      };
      (documentModel.findById as jest.Mock).mockImplementationOnce(() => {
        return { 
          exec: jest.fn().mockResolvedValue(mockDoc),
          populate: jest.fn().mockReturnThis()
        };
      });

      await expect(() => service.retryIngestion('123', '456'))
        .rejects.toThrow('Document can only be retried if it has failed');
    });
  });
});
