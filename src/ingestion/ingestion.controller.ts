import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IngestionService, IngestionStatus } from './ingestion.service';
import { Document } from '../documents/schemas/document.schema';

@ApiTags('ingestion')
@Controller('ingestion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post(':documentId')
  @ApiOperation({ summary: 'Trigger document ingestion' })
  @ApiResponse({ status: 200, description: 'Ingestion triggered successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async triggerIngestion(
    @Param('documentId') documentId: string,
    @Request() req
  ) {
    await this.ingestionService.triggerIngestion(documentId, req.user.id);
    return { message: 'Ingestion triggered successfully' };
  }

  @Get(':documentId/status')
  @ApiOperation({ summary: 'Get ingestion status' })
  @ApiResponse({ status: 200, description: 'Ingestion status returned' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getIngestionStatus(@Param('documentId') documentId: string): Promise<IngestionStatus> {
    return this.ingestionService.getIngestionStatus(documentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingestion tasks' })
  @ApiResponse({ status: 200, description: 'List of ingestion tasks' })
  async getAllTasks() {
    // In a real implementation, this would query Redis for all tasks
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };
  }
}
