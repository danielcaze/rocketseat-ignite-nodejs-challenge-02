import type { FastifyInstance } from "fastify";
import { checkUserLoggedIn } from "../middlewares/check-user-logged-in";
import { AppError } from "../utils/app-error";
import { MealService } from "../services/meal.service";
import { z } from "zod";
import { createZodError } from "../utils/create-zod-error";

const mealController = async (fastify: FastifyInstance) => {
  const mealService = new MealService();

  fastify.get("/", { preHandler: [checkUserLoggedIn] }, async (req, res) => {
    try {
      const meals = await mealService.getAllFromUser(
        req.user!.id,
        req.query as any
      );
      return res.status(200).send({ meals });
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
      return res.status(500).send({ error: "Failed to get all user meals" });
    }
  });

  fastify.post("/", { preHandler: [checkUserLoggedIn] }, async (req, res) => {
    try {
      await mealService.register({
        ...(typeof req.body === "object" ? req.body : {}),
        userId: req.user!.id,
      } as any);
      return res.status(200).send({ message: "Meal registered" });
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
      return res.status(500).send({ error: "Failed to register meal" });
    }
  });

  fastify.get("/:id", { preHandler: [checkUserLoggedIn] }, async (req, res) => {
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
      return res.status(500).send({ error: "Failed to get user meal" });
    }

    try {
      const meal = await mealService.getOneFromUser({
        mealId: params.id,
        userId: req.user!.id,
      });
      return res.status(200).send({ meal });
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
      return res.status(500).send({ error: "Failed to get user meal" });
    }
  });

  fastify.put("/:id", { preHandler: [checkUserLoggedIn] }, async (req, res) => {
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
      return res.status(500).send({ error: "Failed to update" });
    }

    try {
      await mealService.update({
        ...(typeof req.body === "object" ? req.body : {}),
        userId: req.user!.id,
        mealId: params.id,
      } as any);
      return res.status(200).send({ message: "Meal updated" });
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
      return res.status(500).send({ error: "Failed to update meal" });
    }
  });

  fastify.delete(
    "/:id",
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
          return res.status(500).send({ error: "Failed to delete meal" });
        }

        await mealService.delete({
          mealId: params.id,
          userId: req.user!.id,
        });

        return res.status(204).send({ message: "Meal deleted successfully" });
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
        return res.status(500).send({ error: "Failed to delete meal" });
      }
    }
  );
};

export default mealController;
