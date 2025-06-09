"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = exports.DocumentSchema = exports.DocumentClass = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const typegoose_1 = require("@typegoose/typegoose");
const document_status_enum_1 = require("../enums/document-status.enum");
let DocumentClass = class DocumentClass {
};
exports.DocumentClass = DocumentClass;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 255 }),
    __metadata("design:type", String)
], DocumentClass.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], DocumentClass.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentClass.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }],
        default: []
    }),
    __metadata("design:type", Array)
], DocumentClass.prototype, "sharedWith", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: Object.values(document_status_enum_1.DocumentStatus),
        default: document_status_enum_1.DocumentStatus.PENDING
    }),
    __metadata("design:type", String)
], DocumentClass.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: {
            size: { type: Number },
            contentType: { type: String },
            keywords: { type: [String] }
        }
    }),
    __metadata("design:type", Object)
], DocumentClass.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], DocumentClass.prototype, "lastIngestedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['text', 'pdf', 'docx', 'image', 'other'],
        required: true
    }),
    __metadata("design:type", String)
], DocumentClass.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String, trim: true }], default: [] }),
    __metadata("design:type", Array)
], DocumentClass.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DocumentClass.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1 }),
    __metadata("design:type", Number)
], DocumentClass.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], DocumentClass.prototype, "sourceUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], DocumentClass.prototype, "thumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                name: { type: String, required: true },
                value: { type: String, required: true }
            }], default: [] }),
    __metadata("design:type", Array)
], DocumentClass.prototype, "customFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                name: { type: String, required: true },
                value: { type: String, required: true }
            }], default: [] }),
    __metadata("design:type", Array)
], DocumentClass.prototype, "metadataFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], DocumentClass.prototype, "error", void 0);
exports.DocumentClass = DocumentClass = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'documents'
    })
], DocumentClass);
exports.DocumentSchema = mongoose_1.SchemaFactory.createForClass(DocumentClass);
exports.DocumentSchema.index({ title: 'text', content: 'text' }, { name: 'search_index' });
exports.DocumentSchema.index({ createdBy: 1 }, { name: 'createdBy_index' });
exports.DocumentSchema.index({ sharedWith: 1 }, { name: 'sharedWith_index' });
exports.DocumentSchema.index({ status: 1 }, { name: 'status_index' });
exports.DocumentSchema.index({ lastIngestedAt: -1 }, { name: 'ingestion_index' });
exports.DocumentSchema.statics.findByKeyword = async function (keyword) {
    return this.find({ $text: { $search: keyword } });
};
exports.DocumentSchema.statics.findByUser = async function (userId) {
    return this.find({ createdBy: userId });
};
exports.DocumentSchema.statics.findByStatus = async function (status) {
    return this.find({ status });
};
exports.DocumentSchema.statics.findByType = async function (type) {
    return this.find({ type });
};
exports.DocumentSchema.statics.findByTag = async function (tag) {
    return this.find({ tags: tag });
};
exports.DocumentSchema.statics.findByPublic = async function (isPublic) {
    return this.find({ isPublic });
};
exports.DocumentSchema.statics.findByVersion = async function (version) {
    return this.find({ version });
};
exports.DocumentSchema.statics.findBySharedWith = async function (userId) {
    return this.find({ sharedWith: userId });
};
exports.DocumentSchema.statics.findByDateRange = async function (start, end) {
    return this.find({ lastIngestedAt: { $gte: start, $lte: end } });
};
exports.DocumentSchema.statics.findByText = async function (text) {
    return this.find({ $text: { $search: text } });
};
exports.DocumentSchema.statics.findByMetadata = async function (key, value) {
    return this.find({ 'metadataFields.name': key, 'metadataFields.value': value });
};
exports.DocumentSchema.statics.findByCustomField = async function (key, value) {
    return this.find({ 'customFields.name': key, 'customFields.value': value });
};
exports.Document = (0, typegoose_1.getModelForClass)(DocumentClass, {
    schemaOptions: {
        timestamps: true,
        collection: 'documents'
    }
});
//# sourceMappingURL=document.schema.js.map