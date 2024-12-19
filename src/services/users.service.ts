import { z } from "zod";
import bcrypt from "bcrypt";
import db from "../libs/knex";
import { TABLES } from "../enums/tables";
import { CustomZodError } from "../utils/CustomZodError";
import { DatabaseError } from "../utils/DatabaseError";

export class UsersService {
  private createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
  });

  /**
   * Get all users from the database.
   */
  async getAllUsers() {
    return await db(TABLES.USERS).select();
  }

  /**
   * Create a new user.
   * @param requestBody - The incoming request body
   */
  async createUser(requestBody: unknown) {
    let body: z.infer<typeof this.createUserBodySchema>;

    try {
      body = this.createUserBodySchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomZodError(error);
      }
      throw error;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    try {
      await db(TABLES.USERS).insert({
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email,
        password: hashedPassword,
      });
    } catch (error: any) {
      if ("code" in error) {
        throw new DatabaseError(error);
      }
      throw error;
    }
  }
}
