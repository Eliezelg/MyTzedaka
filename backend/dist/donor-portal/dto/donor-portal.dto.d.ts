export declare class CreateDonorProfileDto {
    email: string;
    cognitoId: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class UpdateDonorProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferredCurrency?: string;
    communicationPrefs?: any;
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
    favoriteAssociations?: string[];
    communicationPrefs?: any;
    createdAt: Date;
    updatedAt: Date;
    lastDonationAt?: Date;
}
export declare class DonorHistoryQueryDto {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    tenantId?: string;
    source?: string;
}
export declare class ToggleFavoriteDto {
    tenantId: string;
    action: 'add' | 'remove';
}
export declare class DonorHistoryItemDto {
    id: string;
    amount: number;
    currency: string;
    source: string;
    createdAt: Date;
    tenant: {
        id: string;
        name: string;
        slug: string;
    };
    campaign?: {
        id: string;
        title: string;
    };
    purpose?: string;
    status: string;
}
export declare class DonorHistoryResponseDto {
    donations: DonorHistoryItemDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats: {
        totalAmount: number;
        totalDonations: number;
        averageDonation: number;
        associationsCount: number;
    };
}
export declare class DonorStatsDto {
    global: {
        totalDonations: number;
        totalAmount: number;
        averageDonation: number;
        associationsSupported: number;
        firstDonationDate: Date | null;
        lastDonationDate: Date | null;
    };
    bySources: {
        source: string;
        totalDonations: number;
        totalAmount: number;
        percentage: number;
    }[];
    favoriteAssociations: {
        tenantId: string;
        name: string;
        totalDonated: number;
        donationsCount: number;
        lastDonationDate: Date;
    }[];
    monthlyTrend: {
        month: string;
        totalAmount: number;
        donationsCount: number;
    }[];
}
