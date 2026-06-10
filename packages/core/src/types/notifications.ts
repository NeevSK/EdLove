export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export type NotificationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
