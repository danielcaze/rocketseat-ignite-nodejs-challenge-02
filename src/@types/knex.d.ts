// eslint-disable-next-line
import type { Knex } from "knex";
import type { User } from "../types/user";
import type { Meal } from "../types/meal";
import type { Session } from "../types/session";
import type { VerificationCode } from "../types/verification-code";

declare module "knex/types/tables" {
  interface Tables {
    users: User;

    meals: Meal;

    sessions: Session;

    verification_codes: VerificationCode;
  }
}
