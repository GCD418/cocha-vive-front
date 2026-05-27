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
    organizedByUser: UserDTO;
    latitude: number;
    longitude: number;
    shortPlaceDescription: string;
    tags: string[];
    photoLinks: string[];
    eventStatus: string;
    reviewedByAdminId?: number;
    createdAt: string;
    updatedAt?: string;
    isActive: boolean;
    modifiedByUserId?: number;
    dateStart: string;
    dateEnd: string; 
}
