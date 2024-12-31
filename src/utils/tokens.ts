import { Table } from "../enums/table";
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from "../enums/token";
import { env } from "../libs/dotenv";
import db from "../libs/knex";
import type { User } from "../types/user";
import jwt from "jsonwebtoken";
import { createDatabaseError } from "./create-database-error";
import { ErrorCode } from "../enums/app-error";
import { AppError } from "./app-error";

export const generateAccessToken = (user: User) => {
  const accessToken = jwt.sign(user, env.JWT_SECRET, {
    algorithm: env.JWT_SECRET_ALGORITHM,
    expiresIn: ACCESS_TOKEN_DURATION,
  });

  return accessToken;
};

export const generateRefreshToken = (user: User) => {
  const refreshToken = jwt.sign(user, env.JWT_SECRET, {
    algorithm: env.JWT_SECRET_ALGORITHM,
    expiresIn: REFRESH_TOKEN_DURATION,
  });

  return refreshToken;
};

export async function refreshToken(accessToken: string, sessionId: string) {
  const decoded = jwt.decode(accessToken, { json: true });

  if (!decoded) {
    throw new AppError(ErrorCode.INVALID_TOKEN);
  }

  const user = await db(Table.USERS)
    .where({
      id: decoded.id,
    })
    .first();

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND);
  }

  const session = await db(Table.SESSIONS)
    .where({ user_id: decoded.id, id: sessionId })
    .first();

  if (
    !session ||
    session.revoked ||
    new Date(session.expires_at) < new Date()
  ) {
    throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID);
  }

  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  try {
    await db(Table.SESSIONS)
      .where({
        id: sessionId,
      })
      .update({
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
  } catch (error) {
    if ("code" in error) {
      throw createDatabaseError(error);
    }
    throw error;
  }

  return newAccessToken;
}
