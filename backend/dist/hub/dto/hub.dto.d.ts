export declare class HubStatsDto {
    totalAssociations: number;
    verifiedAssociations: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalDonations: number;
    totalAmount: number;
}
export declare class AssociationSearchDto {
    q?: string;
    query?: string;
    category?: string;
    location?: string;
    verified?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
}
export declare class DonorProfileDto {
    id: string;
    email: string;
    cognitoId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    totalDonations: number;
    totalAmount: number;
    preferredCurrency: string;
    createdAt: Date;
    updatedAt: Date;
    lastDonationAt?: Date;
}
export declare class CreateDonorProfileDto {
    email: string;
    cognitoId: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class RecordActivityDto {
    tenantId: string;
    donationAmount?: number;
    isFavorite?: boolean;
}
