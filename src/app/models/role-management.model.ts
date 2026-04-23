export interface RoleManagedUser {
  id: number;
  names: string;
  firstLastName: string;
  secondLastName?: string;
  email: string;
  role: string;
  photoUrl?: string;
}
