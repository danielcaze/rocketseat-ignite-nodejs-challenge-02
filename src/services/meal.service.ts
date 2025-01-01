import { z } from "zod";
import { createZodError } from "../utils/create-zod-error";
import db from "../libs/knex";
import { Table } from "../enums/table";
import { createDatabaseError } from "../utils/create-database-error";
import { AppError } from "../utils/app-error";
import { ErrorCode } from "../enums/app-error";
import { safeJsonParse } from "../utils/safe-json-parse";

export class MealService {
  private registerMealSchema = z.object({
    name: z.string(),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val ?? ""),
    datetime: z.coerce.date(),
    isOnDiet: z.boolean(),
    userId: z.string().uuid(),
  });

  private updateMealSchema = z.object({
    name: z.string().optional(),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val ?? ""),
    datetime: z.coerce.date().optional(),
    isOnDiet: z.boolean().optional(),
    userId: z.string().uuid().optional(),
    mealId: z.string().uuid().optional(),
  });

  private getOneMealFromUserSchema = z.object({
    mealId: z.string().uuid(),
    userId: z.string().uuid(),
  });

  private deleteMealSchema = z.object({
    mealId: z.string().uuid(),
    userId: z.string().uuid(),
  });

  async register(mealDataAndUser: z.infer<typeof this.registerMealSchema>) {
    let body: z.infer<typeof this.registerMealSchema>;

    try {
      body = this.registerMealSchema.parse(mealDataAndUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    try {
      await db(Table.MEALS).insert({
        name: body.name,
        description: body.description,
        datetime: body.datetime,
        is_on_diet: body.isOnDiet,
        user_id: body.userId,
      });
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
      }
      throw error;
    }
  }

  async update(mealDataAndUser: z.infer<typeof this.updateMealSchema>) {
    let body: z.infer<typeof this.updateMealSchema>;

    try {
      body = this.updateMealSchema.parse(mealDataAndUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    try {
      const mealExists = await db(Table.MEALS)
        .where({ id: body.mealId, user_id: body.userId })
        .first();

      if (!mealExists) {
        throw new AppError(ErrorCode.MEAL_NOT_FOUND);
      }

      await db(Table.MEALS)
        .where({ id: body.mealId, user_id: body.userId })
        .update({
          name: body.name,
          description: body.description,
          datetime: body.datetime,
          is_on_diet: body.isOnDiet,
        });
    } catch (error) {
      if ("code" in error) {
        throw createDatabaseError(error);
      }
      throw error;
    }
  }

  async getAllFromUser(userId: string, query: Record<string, any>) {
    const queryBuilder = db(Table.MEALS).where({ user_id: userId });

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        queryBuilder.whereIn(
          key,
          value.map((v) => safeJsonParse(v))
        );
      } else {
        queryBuilder.where(key, safeJsonParse(value));
      }
    }

    const meals = await queryBuilder.orderBy("created_at", "desc").select();

    return meals;
  }

  async getOneFromUser(
    userMeal: z.infer<typeof this.getOneMealFromUserSchema>
  ) {
    let body: z.infer<typeof this.getOneMealFromUserSchema>;

    try {
      body = this.getOneMealFromUserSchema.parse(userMeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    const mealExists = await db(Table.MEALS)
      .where({ id: body.mealId, user_id: body.userId })
      .first();

    if (!mealExists) {
      throw new AppError(ErrorCode.MEAL_NOT_FOUND);
    }

    const meal = await db(Table.MEALS)
      .where({ id: body.mealId, user_id: body.userId })
      .first();

    return meal;
  }

  async delete(userMeal: z.infer<typeof this.deleteMealSchema>) {
    let body: z.infer<typeof this.deleteMealSchema>;

    try {
      body = this.deleteMealSchema.parse(userMeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createZodError(error);
      }
      throw error;
    }

    const meal = await db(Table.MEALS)
      .where({ id: body.mealId, user_id: body.userId })
      .first();

    if (!meal) {
      throw new AppError(ErrorCode.MEAL_NOT_FOUND);
    }

    await db(Table.MEALS)
      .where({ id: body.mealId, user_id: body.userId })
      .delete();
  }
}
