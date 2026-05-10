export interface TicketResponseDTO {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expired: boolean;
  used: boolean;
  eventId: number;
  buyerUserId: number;
  createdAt: string;
}
