// eslint-disable-next-line
import { type Knex } from "knex";

declare module "knex/types/tables" {
  interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
      updated_at: string;
    };

    meals: {
      id: string;
      user_id: string;
      name: number;
      description: number;
      datetime: string;
      is_on_diet: boolean;
      created_at: string;
      updated_at: string;
    };
  }
}
