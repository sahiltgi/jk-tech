import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { getModelForClass, DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { DocumentStatus } from '../enums/document-status.enum';

// Type declarations
export type DocumentDocument = DocumentType<DocumentClass>;
export type DocumentModel = ReturnModelType<typeof DocumentClass>;

// Document interface
export interface IDocument extends MongooseDocument {
  _id: Types.ObjectId;
  title: string;
  content: string;
  createdBy: Types.ObjectId;
  sharedWith: Types.ObjectId[];
  status: DocumentStatus;
  metadata: {
    size: number;
    contentType: string;
    keywords: string[];
  };
  lastIngestedAt: Date;
  isPublic: boolean;
  type: 'text' | 'pdf' | 'docx' | 'image' | 'other';
  tags: string[];
  version: number;
  sourceUrl: string;
  thumbnail: string;
  customFields: {
    name: string;
    value: string;
  }[];
  metadataFields: {
    name: string;
    value: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  [key: string]: any; // Allow additional properties
}

// Document class
@Schema({
  timestamps: true,
  collection: 'documents'
})
export class DocumentClass {
  @Prop({ required: true, trim: true, maxlength: 255 })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  createdBy: Types.ObjectId;

  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'User' }], 
    default: [] 
  })
  sharedWith: Types.ObjectId[];

  @Prop({ 
    enum: Object.values(DocumentStatus),
    default: DocumentStatus.PENDING
  })
  status: DocumentStatus;

  @Prop({
    required: true,
    type: {
      size: { type: Number },
      contentType: { type: String },
      keywords: { type: [String] }
    }
  })
  metadata: {
    size: number;
    contentType: string;
    keywords: string[];
  };

  @Prop({ default: Date.now })
  lastIngestedAt: Date;

  @Prop({ 
    type: String, 
    enum: ['text', 'pdf', 'docx', 'image', 'other'],
    required: true
  })
  type: 'text' | 'pdf' | 'docx' | 'image' | 'other';

  @Prop({ type: [{ type: String, trim: true }], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ type: String, default: '' })
  sourceUrl: string;

  @Prop({ type: String, default: '' })
  thumbnail: string;

  @Prop({ type: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }], default: [] })
  customFields: {
    name: string;
    value: string;
  }[];

  @Prop({ type: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }], default: [] })
  metadataFields: {
    name: string;
    value: string;
  }[];

  @Prop({ type: String })
  error?: string;

  // Timestamps (automatically added by timestamps: true)
  createdAt: Date;
  updatedAt: Date;
}

// Create schema and add indexes
export const DocumentSchema = SchemaFactory.createForClass(DocumentClass);

// Add indexes
DocumentSchema.index({ title: 'text', content: 'text' }, { name: 'search_index' });
DocumentSchema.index({ createdBy: 1 }, { name: 'createdBy_index' });
DocumentSchema.index({ sharedWith: 1 }, { name: 'sharedWith_index' });
DocumentSchema.index({ status: 1 }, { name: 'status_index' });
DocumentSchema.index({ lastIngestedAt: -1 }, { name: 'ingestion_index' });

// Add static methods to schema
DocumentSchema.statics.findByKeyword = async function(keyword: string) {
  return this.find({ $text: { $search: keyword } });
};

DocumentSchema.statics.findByUser = async function(userId: Types.ObjectId) {
  return this.find({ createdBy: userId });
};

DocumentSchema.statics.findByStatus = async function(status: string) {
  return this.find({ status });
};

DocumentSchema.statics.findByType = async function(type: string) {
  return this.find({ type });
};

DocumentSchema.statics.findByTag = async function(tag: string) {
  return this.find({ tags: tag });
};

DocumentSchema.statics.findByPublic = async function(isPublic: boolean) {
  return this.find({ isPublic });
};

DocumentSchema.statics.findByVersion = async function(version: number) {
  return this.find({ version });
};

DocumentSchema.statics.findBySharedWith = async function(userId: Types.ObjectId) {
  return this.find({ sharedWith: userId });
};

DocumentSchema.statics.findByDateRange = async function(start: Date, end: Date) {
  return this.find({ lastIngestedAt: { $gte: start, $lte: end } });
};

DocumentSchema.statics.findByText = async function(text: string) {
  return this.find({ $text: { $search: text } });
};

DocumentSchema.statics.findByMetadata = async function(key: string, value: string) {
  return this.find({ 'metadataFields.name': key, 'metadataFields.value': value });
};

DocumentSchema.statics.findByCustomField = async function(key: string, value: string) {
  return this.find({ 'customFields.name': key, 'customFields.value': value });
};

// Interface for static methods (optional but recommended for TypeScript)
export interface DocumentStaticMethods {
  findByKeyword(keyword: string): Promise<DocumentDocument[]>;
  findByUser(userId: Types.ObjectId): Promise<DocumentDocument[]>;
  findByStatus(status: string): Promise<DocumentDocument[]>;
  findByType(type: string): Promise<DocumentDocument[]>;
  findByTag(tag: string): Promise<DocumentDocument[]>;
  findByPublic(isPublic: boolean): Promise<DocumentDocument[]>;
  findByVersion(version: number): Promise<DocumentDocument[]>;
  findBySharedWith(userId: Types.ObjectId): Promise<DocumentDocument[]>;
  findByDateRange(start: Date, end: Date): Promise<DocumentDocument[]>;
  findByText(text: string): Promise<DocumentDocument[]>;
  findByMetadata(key: string, value: string): Promise<DocumentDocument[]>;
  findByCustomField(key: string, value: string): Promise<DocumentDocument[]>;
}

// Create and export the model
export const Document = getModelForClass(DocumentClass, { 
  schemaOptions: { 
    timestamps: true, 
    collection: 'documents'
  }
});