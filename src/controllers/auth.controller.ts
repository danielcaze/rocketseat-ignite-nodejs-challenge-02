import type { FastifyInstance } from "fastify";
import { AuthService } from "../services/auth.service";
import { checkUserLoggedIn } from "../middlewares/check-user-logged-in";
import { ACCESS_TOKEN_COOKIE, SESSION_ID_COOKIE } from "../enums/tokens";
import { env } from "../libs/dotenv";

const authController = async (fastify: FastifyInstance) => {
  const authService = new AuthService();

  fastify.post("/login", async (req, res) => {
    try {
      const { accessToken, sessionId } = await authService.login(
        req.body,
        req.headers["user-agent"],
        req.ip
      );

      res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
      });
      res.cookie(SESSION_ID_COOKIE, sessionId, {
        path: "/",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
      });

      res.status(200).send({ message: "User logged in successfully" });
    } catch (error) {
      if (error.name === "CustomZodError" || error.name === "DatabaseError") {
        res.status(400).send({
          name: error.name,
          message: error.details,
        });
      } else {
        fastify.log.error(error);
        res.status(500).send({ error: "Failed to login" });
      }
    }
  });

  fastify.post("/register", async (req, res) => {
    try {
      await authService.register(req.body);
      res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
      if (error.name === "CustomZodError" || error.name === "DatabaseError") {
        res.status(400).send({
          name: error.name,
          message: error.details,
        });
      } else {
        fastify.log.error(error);
        res.status(500).send({ error: "Failed to register user" });
      }
    }
  });

  fastify.post(
    "/logout",
    { preHandler: [checkUserLoggedIn] },
    async (req, res) => {
      try {
        const sessionId = req.cookies[SESSION_ID_COOKIE]!;

        await authService.logout(sessionId);
        res.clearCookie(ACCESS_TOKEN_COOKIE);
        res.clearCookie(SESSION_ID_COOKIE);

        res.status(200).send({ message: "User logged out successfully" });
      } catch (error) {
        if (error.name === "CustomZodError" || error.name === "DatabaseError") {
          res.status(400).send({
            name: error.name,
            message: error.details,
          });
        } else {
          fastify.log.error(error);
          res.status(500).send({ error: "Failed to refresh token" });
        }
      }
    }
  );

  fastify.post("/update-password", async (req, res) => {
    try {
      const sessionId = req.cookies[SESSION_ID_COOKIE];

      await authService.updatePassword(req.body, sessionId);

      res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      if (error.name === "CustomZodError" || error.name === "DatabaseError") {
        res.status(400).send({
          name: error.name,
          message: error.details,
        });
      } else {
        fastify.log.error(error);
        res.status(500).send({ error: "Failed to update password" });
      }
    }
  });
};

export default authController;
