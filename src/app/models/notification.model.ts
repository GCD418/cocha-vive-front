export interface NotificationItem {
  id: number;
  title: string;
  shortDescription?: string | null;
  unread: boolean;
  createdAt: string;
}
