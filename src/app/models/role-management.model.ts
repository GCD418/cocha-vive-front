export interface RoleManagedUser {
  id: number;
  names: string;
  firstLastName: string;
  secondLastName?: string | null;
  email: string;
  role: string;
  photoUrl?: string | null;
  createdAt?: string;
}
