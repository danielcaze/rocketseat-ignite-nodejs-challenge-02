import { TABLES } from "../enums/tables";
import { ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } from "../enums/tokens";
import { env } from "../libs/dotenv";
import db from "../libs/knex";
import type { User } from "../types/user";
import jwt from "jsonwebtoken";

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
    throw new Error("Invalid token");
  }

  const user = await db(TABLES.USERS)
    .where({
      id: decoded.id,
    })
    .first();

  if (!user) {
    throw new Error("Invalid user");
  }

  const session = await db("sessions")
    .where({ user_id: decoded.id, id: sessionId })
    .first();

  if (
    !session ||
    session.revoked ||
    new Date(session.expires_at) < new Date()
  ) {
    throw new Error("Refresh token expired or invalid");
  }

  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  await db(TABLES.SESSIONS)
    .where({
      id: sessionId,
    })
    .update({
      refresh_token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      updated_at: new Date(),
    });

  return newAccessToken;
}
