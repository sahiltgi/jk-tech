import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DocumentStatus } from '../documents/enums/document-status.enum';
import { HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            triggerIngestion: jest.fn(),
            getIngestionStatus: jest.fn(),
            getAllTasks: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerIngestion', () => {
    const mockRequest = {
      user: {
        id: '456',
        email: 'test@example.com',
        roles: []
      }
    };

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
