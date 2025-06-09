import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DocumentSchema } from '../documents/schemas/document.schema';
import { UserSchema } from '../users/entities/user.entity';
import { Queue, Worker } from 'bullmq';
import { getModelToken } from '@nestjs/mongoose';
import { Document, DocumentDocument } from '../documents/schemas/document.schema';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    MongooseModule.forFeature([
      { name: 'Document', schema: DocumentSchema },
      { name: 'User', schema: UserSchema }
    ])
  ],
  controllers: [IngestionController],
  providers: [
    {
      provide: 'DOCUMENT_MODEL',
      useFactory: (model: any) => model,
      inject: [getModelToken('Document')]
    },
    {
      provide: 'USER_MODEL',
      useFactory: (model: any) => model,
      inject: [getModelToken('User')]
    },
    {
      provide: 'INGESTION_QUEUE',
      useFactory: async (configService: ConfigService) => {
        return new Queue('document-ingestion', {
          connection: {
            host: 'redis',
            port: 6379
          }
        });
      },
      inject: [ConfigService]
    },
    IngestionService,
    {
      provide: 'INGESTION_WORKER',
      useFactory: async (configService: ConfigService, ingestionService: IngestionService) => {
        const queue = new Queue('document-ingestion', {
          connection: {
            host: 'redis',
            port: 6379
          }
        });
        return new Worker('document-ingestion', async (job) => {
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
      inject: [ConfigService, IngestionService]
    }
  ]
})
export class IngestionModule {}
