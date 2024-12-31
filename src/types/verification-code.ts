export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
  is_used: boolean;
}
