export interface Category {
  id: number;
  name: string;
  description: string;
  identifyingIcon: string;

  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  modifiedByUserId?: number;
}