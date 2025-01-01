import type { FastifyInstance } from "fastify";
import { checkUserLoggedIn } from "../middlewares/check-user-logged-in";
import { UserService } from "../services/user.service";
import { createZodError } from "../utils/create-zod-error";
import { z } from "zod";
import { AppError } from "../utils/app-error";
import { ErrorCode } from "../enums/app-error";

const userController = async (fastify: FastifyInstance) => {
  const userService = new UserService();

  fastify.get(
    "/:id/metrics",
    { preHandler: [checkUserLoggedIn] },
    async (req, res) => {
      try {
        const getMealsParamsSchema = z.object({
          id: z.string().uuid(),
        });

        let params: z.infer<typeof getMealsParamsSchema>;

        try {
          params = getMealsParamsSchema.parse(req.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const appError = createZodError(error);
            return res.status(appError.statusCode).send({
              name: appError.name,
              code: appError.code,
              message: appError.message,
              details: appError.details,
            });
          }
          fastify.log.error(error);
          return res.status(500).send({ error: "Failed to get user metrics" });
        }

        if (req.user!.id !== params.id) {
          throw new AppError(ErrorCode.UNAUTHORIZED);
        }

        const metrics = await userService.getMetricsFromUser(params.id);

        return res.status(200).send({ metrics });
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
        return res.status(500).send({ error: "Failed to get user metrics" });
      }
    }
  );
};

export default userController;
