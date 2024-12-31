import type { FastifyReply, FastifyRequest } from "fastify";
import { ACCESS_TOKEN_COOKIE, SESSION_ID_COOKIE } from "../enums/token";
import jwt from "jsonwebtoken";
import { env } from "../libs/dotenv";
import type { User } from "../types/user";
import db from "../libs/knex";
import { Table } from "../enums/table";
import { refreshToken } from "../utils/tokens";
import { AppError } from "../utils/app-error";
import { ErrorCode } from "../enums/app-error";

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

    const session = await db(Table.SESSIONS).where({ id: sessionId }).first();

    if (!session || session?.revoked) {
      throw new AppError(ErrorCode.SESSION_REVOKED);
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
