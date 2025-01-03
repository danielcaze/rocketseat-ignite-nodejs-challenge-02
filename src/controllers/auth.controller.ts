import type { FastifyInstance } from "fastify";
import { AuthService } from "../services/auth.service";
import { checkUserLoggedIn } from "../middlewares/check-user-logged-in";
import { CSRF_TOKEN_COOKIE, SESSION_ID_COOKIE } from "../enums/token";
import { env } from "../libs/dotenv";
import { AppError } from "../utils/app-error";

const authController = async (fastify: FastifyInstance) => {
  const authService = new AuthService();

  fastify.post("/login", async (req, res) => {
    try {
      const { csrfToken, sessionId } = await authService.login(
        req.body,
        req.headers["user-agent"],
        req.ip
      );

      res.setCookie(SESSION_ID_COOKIE, sessionId, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
      });

      res.setCookie(CSRF_TOKEN_COOKIE, csrfToken, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: false,
        sameSite: "strict",
      });

      return res.status(200).send({ message: "User logged in successfully" });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).send({
          name: error.name,
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      fastify.log.error(error);
      return res.status(500).send({ error: "Failed to login" });
    }
  });

  fastify.post("/register", async (req, res) => {
    try {
      await authService.register(req.body);
      return res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).send({
          name: error.name,
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      fastify.log.error(error);
      return res.status(500).send({ error: "Failed to register user" });
    }
  });

  fastify.post(
    "/logout",
    { preHandler: [checkUserLoggedIn] },
    async (req, res) => {
      try {
        const sessionId = req.cookies[SESSION_ID_COOKIE]!;

        await authService.logout(sessionId);
        res.clearCookie(CSRF_TOKEN_COOKIE);
        res.clearCookie(SESSION_ID_COOKIE);

        return res
          .status(200)
          .send({ message: "User logged out successfully" });
      } catch (error) {
        if (error instanceof AppError) {
          return res.status(error.statusCode).send({
            name: error.name,
            code: error.code,
            message: error.message,
            details: error.details,
          });
        }

        fastify.log.error(error);
        return res.status(500).send({ error: "Failed to refresh token" });
      }
    }
  );

  fastify.post("/update-password", async (req, res) => {
    try {
      const sessionId = req.cookies[SESSION_ID_COOKIE];

      await authService.updatePassword(req.body, sessionId);

      return res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).send({
          name: error.name,
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      fastify.log.error(error);
      return res.status(500).send({ error: "Failed to update password" });
    }
  });
};

export default authController;
