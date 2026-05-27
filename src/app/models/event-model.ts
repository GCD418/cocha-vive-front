export interface CategoryDTO {
    id: number;
    name: string;
    description: string;
    identifyingIcon: string;
}

export interface UserDTO {
    id: number;
    names: string;
    firstLastName: string;
    secondLastName?: string;
}
export interface EventModel {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    cost: number;
    categoryId: number;
    categoryName: string;
    organizedByUserId: number;
    organizedByUserName: string;
    latitude: number;
    longitude: number;
    shortPlaceDescription: string;
    peopleCapacity: number;
    tags: string[];
    photoLinks: string[];
    eventStatus: string;
    isActive: boolean;
    createdAt: string;
    dateStart: string;
    dateEnd: string;

    isFeatured: boolean;
    promotionType: string | null;
    promotionSlot: string | null;
    expiresAt: string | null;
}
