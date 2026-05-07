export interface ThuthimalGift {
  id: string;
  gift_token: string;
  gifter_id: string;
  gifter_name: string;
  recipient_tier: 'teacher' | 'principal';
  recipient_id?: string | null;
  claimed: boolean;
  claimed_at?: string | null;
  claimed_by_id?: string | null;
  expires_at?: string | null;
  message?: string | null;
  created_at: string;
  updated_at: string;
}
