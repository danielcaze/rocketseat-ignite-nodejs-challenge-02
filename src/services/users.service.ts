import db from "../libs/knex";
import { TABLES } from "../enums/tables";

export class UsersService {
  async getAllUsers() {
    return await db(TABLES.USERS).select();
  }
}
