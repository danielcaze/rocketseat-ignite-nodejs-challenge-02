import type { FastifyInstance } from "fastify";
import { EmailService } from "../services/email.service";

const emailController = async (fastify: FastifyInstance) => {
  const emailService = new EmailService();

  fastify.post("/verification-code", async (req, res) => {
    try {
      await emailService.sendVerificationCode(req.body);

      res.status(200).send({ message: "Verification code sent" });
    } catch (error) {
      if (error.name === "CustomZodError" || error.name === "DatabaseError") {
        res.status(400).send({
          name: error.name,
          message: error.details,
        });
      } else {
        fastify.log.error(error);
        res.status(500).send({ error: "Failed to send verification code" });
      }
    }
  });
};

export default emailController;
