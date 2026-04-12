export type PublisherRequestStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export type PublisherRequestFilterMode = 'pending' | 'all';

export interface PublisherRequestCreatePayload {
  requestReason: string;
  legalEntityName: string;
}

export interface PublisherRequestCreatedByUser {
  id: number;
  names: string;
  firstLastName: string;
  secondLastName: string | null;
  email: string;
  photoUrl: string | null;
}

export interface PublisherRequest {
  id: number;
  requestReason: string;
  legalEntityName: string;
  evidenceImages: string[];
  createdByUser: PublisherRequestCreatedByUser;
  requestStatus: PublisherRequestStatus;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  modifiedByUserId: number | null;
}
