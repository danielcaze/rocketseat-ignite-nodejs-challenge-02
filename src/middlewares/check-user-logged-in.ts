import type { FastifyReply, FastifyRequest } from "fastify";
import { ACCESS_TOKEN_COOKIE, SESSION_ID_COOKIE } from "../enums/tokens";
import jwt from "jsonwebtoken";
import { env } from "../libs/dotenv";
import type { User } from "../types/user";
import { AuthService } from "../services/auth.service";
import db from "../libs/knex";
import { TABLES } from "../enums/tables";
import { refreshToken } from "../utils/tokens";

export async function checkUserLoggedIn(
  req: FastifyRequest,
  res: FastifyReply
) {
  const token = req.cookies[ACCESS_TOKEN_COOKIE];
  const sessionId = req.cookies[SESSION_ID_COOKIE];

  if (!token || !sessionId) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, env.JWT_SECRET);

    const session = await db(TABLES.SESSIONS).where({ id: sessionId }).first();

    if (!session || session?.revoked) {
      throw new Error("Session revoked");
    }

    req.user = user as User;
  } catch (error) {
    if (error.message !== "jwt expired") {
      res.clearCookie(ACCESS_TOKEN_COOKIE);
      res.clearCookie(SESSION_ID_COOKIE);
      return res.status(401).send({ message: "Unauthorized" });
    }

    try {
      const newAccessToken = await refreshToken(token, sessionId);

      res.setCookie(ACCESS_TOKEN_COOKIE, newAccessToken);
      const user = jwt.decode(newAccessToken);
      req.user = user as User;
    } catch (err) {
      res.clearCookie(ACCESS_TOKEN_COOKIE);
      res.clearCookie(SESSION_ID_COOKIE);
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
}
