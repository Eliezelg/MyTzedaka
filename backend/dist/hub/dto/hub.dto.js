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
exports.RecordActivityDto = exports.CreateDonorProfileDto = exports.DonorProfileDto = exports.AssociationSearchDto = exports.HubStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class HubStatsDto {
}
exports.HubStatsDto = HubStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre total d\'associations' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "totalAssociations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre d\'associations vérifiées' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "verifiedAssociations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre total de campagnes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "totalCampaigns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de campagnes actives' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "activeCampaigns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre total de dons' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "totalDonations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant total des dons' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], HubStatsDto.prototype, "totalAmount", void 0);
class AssociationSearchDto {
}
exports.AssociationSearchDto = AssociationSearchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Terme de recherche' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssociationSearchDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Terme de recherche (alias pour q)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssociationSearchDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Catégorie de l\'association' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssociationSearchDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Localisation de l\'association' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssociationSearchDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filtre par associations vérifiées' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], AssociationSearchDto.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Critère de tri (relevance, name, created_at)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssociationSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Numéro de page' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], AssociationSearchDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limite de résultats par page' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], AssociationSearchDto.prototype, "limit", void 0);
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
class RecordActivityDto {
}
exports.RecordActivityDto = RecordActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du tenant' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordActivityDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Montant du don' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    __metadata("design:type", Number)
], RecordActivityDto.prototype, "donationAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Marquer comme favori' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], RecordActivityDto.prototype, "isFavorite", void 0);
//# sourceMappingURL=hub.dto.js.map