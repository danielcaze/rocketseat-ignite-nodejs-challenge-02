import { z } from "zod";
import bcrypt from "bcrypt";
import { CustomZodError } from "../utils/custom-zod-error";
import jwt from "jsonwebtoken";
import db from "../libs/knex";
import { TABLES } from "../enums/tables";
import { env } from "../libs/dotenv";
import { DatabaseError } from "../utils/database-error";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

export class AuthService {
  private userRegisterBodySchema = z.object({
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

  private userLoginBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  async register(requestBody: unknown) {
    let body: z.infer<typeof this.userRegisterBodySchema>;

    try {
      body = this.userRegisterBodySchema.parse(requestBody);
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
    } catch (error) {
      if ("code" in error) {
        throw new DatabaseError(error);
      }
      throw error;
    }
  }

  async login(
    requestBody: unknown,
    userAgent: string | undefined,
    ipAddress: string
  ) {
    let body: z.infer<typeof this.userLoginBodySchema>;

    try {
      body = this.userLoginBodySchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomZodError(error);
      }
      throw error;
    }

    const user = await db(TABLES.USERS)
      .where({
        email: body.email,
      })
      .first();

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    const sessionId = crypto.randomUUID();

    await db(TABLES.SESSIONS).insert({
      id: sessionId,
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { accessToken, sessionId };
  }

  async logout(sessionId: string) {
    await db(TABLES.SESSIONS)
      .where({
        id: sessionId,
      })
      .update({
        revoked: true,
        updated_at: new Date(),
      });
  }
}
