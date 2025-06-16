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
exports.DonorStatsDto = exports.DonorHistoryResponseDto = exports.DonorHistoryItemDto = exports.ToggleFavoriteDto = exports.DonorHistoryQueryDto = exports.DonorProfileDto = exports.UpdateDonorProfileDto = exports.CreateDonorProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateDonorProfileDto {
}
exports.CreateDonorProfileDto = CreateDonorProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email du donateur' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDonorProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID Cognito' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDonorProfileDto.prototype, "cognitoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prénom' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDonorProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom de famille' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDonorProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Téléphone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDonorProfileDto.prototype, "phone", void 0);
class UpdateDonorProfileDto {
}
exports.UpdateDonorProfileDto = UpdateDonorProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Prénom' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonorProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nom de famille' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonorProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Téléphone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonorProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Devise préférée' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDonorProfileDto.prototype, "preferredCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Préférences de communication' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateDonorProfileDto.prototype, "communicationPrefs", void 0);
class DonorProfileDto {
}
exports.DonorProfileDto = DonorProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du profil donateur' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email du donateur' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID Cognito' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "cognitoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prénom' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom de famille' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Téléphone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre total de dons' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], DonorProfileDto.prototype, "totalDonations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant total des dons' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], DonorProfileDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Devise préférée' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorProfileDto.prototype, "preferredCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Associations favorites' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DonorProfileDto.prototype, "favoriteAssociations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Préférences de communication' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DonorProfileDto.prototype, "communicationPrefs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de création' }),
    __metadata("design:type", Date)
], DonorProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de mise à jour' }),
    __metadata("design:type", Date)
], DonorProfileDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date du dernier don' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], DonorProfileDto.prototype, "lastDonationAt", void 0);
class DonorHistoryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.DonorHistoryQueryDto = DonorHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], DonorHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre d\'éléments par page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], DonorHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de début (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DonorHistoryQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de fin (ISO string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DonorHistoryQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du tenant pour filtrer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorHistoryQueryDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source du don',
        enum: ['PLATFORM', 'CUSTOM_SITE', 'API', 'IMPORT']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PLATFORM', 'CUSTOM_SITE', 'API', 'IMPORT']),
    __metadata("design:type", String)
], DonorHistoryQueryDto.prototype, "source", void 0);
class ToggleFavoriteDto {
}
exports.ToggleFavoriteDto = ToggleFavoriteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du tenant (association)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToggleFavoriteDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action à effectuer',
        enum: ['add', 'remove']
    }),
    (0, class_validator_1.IsEnum)(['add', 'remove']),
    __metadata("design:type", String)
], ToggleFavoriteDto.prototype, "action", void 0);
class DonorHistoryItemDto {
}
exports.DonorHistoryItemDto = DonorHistoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du don' }),
    __metadata("design:type", String)
], DonorHistoryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant du don' }),
    __metadata("design:type", Number)
], DonorHistoryItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Devise' }),
    __metadata("design:type", String)
], DonorHistoryItemDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source du don' }),
    __metadata("design:type", String)
], DonorHistoryItemDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date du don' }),
    __metadata("design:type", Date)
], DonorHistoryItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Association bénéficiaire' }),
    __metadata("design:type", Object)
], DonorHistoryItemDto.prototype, "tenant", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campagne liée' }),
    __metadata("design:type", Object)
], DonorHistoryItemDto.prototype, "campaign", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'But du don' }),
    __metadata("design:type", String)
], DonorHistoryItemDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statut du don' }),
    __metadata("design:type", String)
], DonorHistoryItemDto.prototype, "status", void 0);
class DonorHistoryResponseDto {
}
exports.DonorHistoryResponseDto = DonorHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Liste des dons', type: [DonorHistoryItemDto] }),
    __metadata("design:type", Array)
], DonorHistoryResponseDto.prototype, "donations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination' }),
    __metadata("design:type", Object)
], DonorHistoryResponseDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statistiques de la période' }),
    __metadata("design:type", Object)
], DonorHistoryResponseDto.prototype, "stats", void 0);
class DonorStatsDto {
}
exports.DonorStatsDto = DonorStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statistiques globales' }),
    __metadata("design:type", Object)
], DonorStatsDto.prototype, "global", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statistiques par source' }),
    __metadata("design:type", Array)
], DonorStatsDto.prototype, "bySources", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associations favorites' }),
    __metadata("design:type", Array)
], DonorStatsDto.prototype, "favoriteAssociations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tendance par mois (12 derniers mois)' }),
    __metadata("design:type", Array)
], DonorStatsDto.prototype, "monthlyTrend", void 0);
//# sourceMappingURL=donor-portal.dto.js.map