export type PublisherRequestStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export type PublisherRequestFilterMode = 'pending' | 'all';

export interface PublisherRequest {
  id: number;
  requestReason: string;
  legalEntityName: string;
  evidenceImages: string[];
  createdByUserId: number;
  requestStatus: PublisherRequestStatus;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  modifiedByUserId: number | null;
}
