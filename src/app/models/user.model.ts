export interface UserModel {
  id: number;
  names: string;
  firstLastName: string;
  secondLastName?: string | null;
  email: string;
  photoUrl?: string | null;
  role: string;
  createdAt: string;
}

export type RoleChangeResponse = {
  id: number;
  email: string;
  role: string;
};