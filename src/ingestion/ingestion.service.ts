import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Document, DocumentDocument, IDocument } from '../documents/schemas/document.schema';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DocumentStatus } from '../documents/enums/document-status.enum';

export interface IngestionStatus {
  status: DocumentStatus;
  lastIngestedAt?: Date;
  error?: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly maxRetries = 3;

  constructor(
    @Inject('DOCUMENT_MODEL') private readonly documentModel: any,
    @Inject('USER_MODEL') private readonly userModel: any,
    private readonly configService: ConfigService,
    @Inject('INGESTION_QUEUE') private readonly queue: Queue
  ) {}

  async triggerIngestion(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.documentModel.findById(documentId)
        .populate('createdBy', 'email roles')
        .exec();

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Check authorization
      if (document.createdBy._id.toString() !== userId) {
        throw new HttpException('Unauthorized: Document does not belong to user', HttpStatus.UNAUTHORIZED);
      }

      // Update document status to PROCESSING
      const updatedDoc = await this.documentModel.findByIdAndUpdate(
        documentId,
        { status: DocumentStatus.PROCESSING },
        { new: true }
      ).exec();

      if (!updatedDoc) {
        throw new HttpException('Failed to update document status', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Add job to queue
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

    } catch (error) {
      this.logger.error(`Failed to trigger ingestion: ${error.message}`);
      
      // Update document status to FAILED if it was set to PROCESSING
      try {
        await this.documentModel.findByIdAndUpdate(
          documentId,
          { 
            status: DocumentStatus.FAILED,
            error: error.message 
          }
        ).exec();
      } catch (updateError) {
        this.logger.error(`Failed to update document status after error: ${updateError.message}`);
      }
      
      throw error;
    }
  }

  async processDocument(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.documentModel.findById(documentId).exec();
      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Check if document is not already being processed
      if (document.status === DocumentStatus.PROCESSING) {
        throw new HttpException('Document is already being processed', HttpStatus.CONFLICT);
      }

      // Set status to PROCESSING at the start of processing
      await this.documentModel.findByIdAndUpdate(
        documentId,
        { status: DocumentStatus.PROCESSING },
        { new: true }
      ).exec();

      // TODO: Replace with actual document processing logic
      // This is where you would call your Python service
      // For now, we'll simulate processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Update document status to COMPLETED
      const updatedDoc = await this.documentModel.findByIdAndUpdate(
        documentId,
        { 
          status: DocumentStatus.COMPLETED,
          lastIngestedAt: new Date(),
          error: null // Clear any previous errors
        },
        { new: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new HttpException('Failed to update document status', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      this.logger.log(`Document ${documentId} processed successfully`);

    } catch (error) {
      this.logger.error(`Failed to process document ${documentId}: ${error.message}`);
      
      // Update document status to FAILED
      try {
        await this.documentModel.findByIdAndUpdate(
          documentId,
          { 
            status: DocumentStatus.FAILED,
            error: error.message 
          },
          { new: true }
        ).exec();
      } catch (updateError) {
        this.logger.error(`Failed to update document status after processing error: ${updateError.message}`);
      }
      
      throw error;
    }
  }

  async getIngestionStatus(documentId: string): Promise<IngestionStatus> {
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    return {
      status: document.status,
      lastIngestedAt: document.lastIngestedAt,
      error: document.error || undefined
    };
  }

  async retryIngestion(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.documentModel.findById(documentId)
        .populate('createdBy', 'email roles')
        .exec();

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Check authorization
      if (document.createdBy._id.toString() !== userId) {
        throw new HttpException('Unauthorized: Document does not belong to user', HttpStatus.UNAUTHORIZED);
      }

      // Only allow retry if document is in FAILED status
      if (document.status !== DocumentStatus.FAILED) {
        throw new HttpException('Document can only be retried if it has failed', HttpStatus.BAD_REQUEST);
      }

      // Reset status and trigger ingestion
      await this.triggerIngestion(documentId, userId);

    } catch (error) {
      this.logger.error(`Failed to retry ingestion: ${error.message}`);
      throw error;
    }
  }

  async cancelIngestion(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.documentModel.findById(documentId)
        .populate('createdBy', 'email roles')
        .exec();

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Check authorization
      if (document.createdBy._id.toString() !== userId) {
        throw new HttpException('Unauthorized: Document does not belong to user', HttpStatus.UNAUTHORIZED);
      }

      // Only allow cancellation if document is in PROCESSING status
      if (document.status !== DocumentStatus.PROCESSING) {
        throw new HttpException('Only processing documents can be cancelled', HttpStatus.BAD_REQUEST);
      }

      // Update status to cancelled/failed
      await this.documentModel.findByIdAndUpdate(
        documentId,
        { 
          status: DocumentStatus.FAILED,
          error: 'Cancelled by user'
        },
        { new: true }
      ).exec();

      this.logger.log(`Ingestion cancelled for document ${documentId}`);

    } catch (error) {
      this.logger.error(`Failed to cancel ingestion: ${error.message}`);
      throw error;
    }
  }
}