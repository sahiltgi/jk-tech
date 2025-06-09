import { Document as MongooseDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { DocumentStatus } from '../enums/document-status.enum';
export type DocumentDocument = DocumentType<DocumentClass>;
export type DocumentModel = ReturnModelType<typeof DocumentClass>;
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
    [key: string]: any;
}
export declare class DocumentClass {
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
    type: 'text' | 'pdf' | 'docx' | 'image' | 'other';
    tags: string[];
    isPublic: boolean;
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
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DocumentSchema: MongooseSchema<DocumentClass, import("mongoose").Model<DocumentClass, any, any, any, MongooseDocument<unknown, any, DocumentClass, any> & DocumentClass & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DocumentClass, MongooseDocument<unknown, {}, import("mongoose").FlatRecord<DocumentClass>, {}> & import("mongoose").FlatRecord<DocumentClass> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
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
export declare const Document: ReturnModelType<typeof DocumentClass, import("@typegoose/typegoose/lib/types").BeAnObject>;
