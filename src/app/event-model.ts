export interface EventModel {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    cost: number;
    category: string;
    organizedByUser: number;
    tags: string[];
    photoLinks: string[];
    eventStatus: boolean;
    reviewedByAdminId?: number;
    createdAt: string;
    updatedAt?: string;
    isActive: boolean;
    modifiedByUserId?: number;
}
