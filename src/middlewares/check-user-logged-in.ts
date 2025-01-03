import type { FastifyReply, FastifyRequest } from "fastify";
import { CSRF_TOKEN_HEADER, SESSION_ID_COOKIE } from "../enums/token";
import { env } from "../libs/dotenv";
import type { User } from "../types/user";
import db from "../libs/knex";
import { Table } from "../enums/table";
import { AppError } from "../utils/app-error";
import { ErrorCode } from "../enums/app-error";

export async function checkUserLoggedIn(
  req: FastifyRequest,
  res: FastifyReply
) {
  const sessionId = req.cookies[SESSION_ID_COOKIE];
  const csrfTokenFromHeader = req.headers[CSRF_TOKEN_HEADER];

  try {
    if (!sessionId || !csrfTokenFromHeader) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const session = await db(Table.SESSIONS).where({ id: sessionId }).first();

    if (!session || session.is_revoked) {
      throw new AppError(ErrorCode.SESSION_REVOKED);
    }

    if (new Date(session.expires_at) < new Date()) {
      throw new AppError(ErrorCode.SESSION_EXPIRED);
    }

    if (session.csrf_token !== csrfTokenFromHeader) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const user = await db(Table.USERS).where({ id: session.user_id }).first();

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND);
    }

    req.user = user as User;
  } catch (error) {
    res.clearCookie(SESSION_ID_COOKIE);
    res.clearCookie(CSRF_TOKEN_HEADER);

    if (error instanceof AppError) {
      return res.status(error.statusCode).send({
        name: error.name,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    return res.status(401).send({ message: "Unauthorized" });
  }
}
