export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent?: string;
  ip_address?: string;
  expires_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
  is_revoked: boolean;
}
