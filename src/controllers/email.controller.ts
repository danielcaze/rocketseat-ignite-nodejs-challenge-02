import type { FastifyInstance } from "fastify";
import { EmailService } from "../services/email.service";
import { AppError } from "../utils/app-error";

const emailController = async (fastify: FastifyInstance) => {
  const emailService = new EmailService();

  fastify.post("/verification-code", async (req, res) => {
    try {
      await emailService.sendVerificationCode(req.body);
      res.status(200).send({ message: "Verification code sent" });
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
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao enviar o código de verificação." });
    }
  });
};

export default emailController;
