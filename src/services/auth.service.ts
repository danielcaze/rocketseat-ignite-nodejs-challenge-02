import { z } from "zod";
import bcrypt from "bcrypt";
import db from "../libs/knex";
import { Table } from "../enums/table";
import { env } from "../libs/dotenv";
import { createDatabaseError } from "../utils/create-database-error";
import { generateCsrfToken } from "../utils/tokens";
import { createZodError } from "../utils/create-zod-error";
import { AppError } from "../utils/app-error";
import { ErrorCode, ErrorMessage, ErrorStatusCode } from "../enums/app-error";

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

  private userUpdatePasswordSchema = z
    .object({
      userId: z.string(),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
      confirmPassword: z.string(),
      verificationCode: z
        .string()
        .min(6, "Code must be 6 characters long")
        .max(6, "Code must be 6 characters long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Confirm password must be equal to new password",
      path: ["confirmPassword"],
    });

  async register(requestBody: unknown) {
    let body: z.infer<typeof this.userRegisterBodySchema>;

    try {
      body = this.userRegisterBodySchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    try {
      await db(Table.USERS).insert({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      });
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
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
        throw createZodError(error);
      }
      throw error;
    }

    const user = await db(Table.USERS)
      .where({
        email: body.email,
      })
      .first();

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const csrfToken = generateCsrfToken();

    try {
      const sessionId = crypto.randomUUID();

      await db(Table.SESSIONS).insert({
        id: sessionId,
        user_id: user.id,
        csrf_token: csrfToken,
        user_agent: userAgent,
        ip_address: ipAddress,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return { csrfToken, sessionId };
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
      }
      throw error;
    }
  }

  async logout(sessionId: string) {
    try {
      await db(Table.SESSIONS)
        .where({
          id: sessionId,
        })
        .update({
          is_revoked: true,
          updated_at: new Date(),
        });
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
      }
      throw error;
    }
  }

  async updatePassword(requestBody: unknown, sessionId: string | undefined) {
    let body: z.infer<typeof this.userUpdatePasswordSchema>;

    try {
      body = this.userUpdatePasswordSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    const verificationRecord = await db(Table.VERIFICATION_CODES)
      .where({ user_id: body.userId, code: body.verificationCode })
      .andWhere("expires_at", ">=", new Date())
      .first();

    if (!verificationRecord) {
      throw new AppError(ErrorCode.INVALID_OR_EXPIRED_VERIFICATION_CODE);
    }

    if (verificationRecord.is_used) {
      throw new AppError(ErrorCode.VERIFICATION_CODE_USED);
    }

    try {
      await db(Table.VERIFICATION_CODES)
        .where({ id: verificationRecord.id })
        .update({ is_used: true });

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);

      await db(Table.USERS).where({ id: body.userId }).update({
        password: hashedPassword,
      });

      await db(Table.SESSIONS)
        .where({ user_id: body.userId, is_revoked: false })
        .andWhereNot({ id: sessionId })
        .update({ is_revoked: true });
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
      }
      throw error;
    }
  }
}
