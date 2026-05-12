export interface TicketResponseDTO {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expired: boolean;
  used: boolean;
  eventId: number;
  eventTitle: string;
  eventCategoryName: string;
  eventDateStart: string;
  eventDateEnd: string;
  buyerUserId: number;
  createdAt: string;
}
