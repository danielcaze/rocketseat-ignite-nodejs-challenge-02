export interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  datetime: Date | string;
  is_on_diet: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}
