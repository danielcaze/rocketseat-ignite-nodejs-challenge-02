import { ErrorCode } from "../enums/app-error";
import { Table } from "../enums/table";
import db from "../libs/knex";
import { AppError } from "../utils/app-error";

export class UserService {
  async getMetricsFromUser(userId: string) {
    const user = await db(Table.USERS).where({ id: userId }).first();

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND);
    }

    const meals = await db(Table.MEALS)
      .where({ user_id: userId })
      .orderBy("created_at", "asc")
      .select();

    const streaks = meals.reduce(
      (acc, value) => {
        if (value.is_on_diet && acc.currentStreak === 0) {
          acc.currentStreak = 1;
          acc.longestStreak = 1;
        } else if (value.is_on_diet) {
          acc.currentStreak++;
          acc.longestStreak = Math.max(acc.longestStreak, acc.currentStreak);
        } else {
          acc.currentStreak = 0;
        }
        return acc;
      },
      { currentStreak: 0, longestStreak: 0 }
    );

    return {
      totalMeals: meals.length,
      withinDietMeals: meals.filter((meal) => meal.is_on_diet).length,
      outDietMeals: meals.filter((meal) => !meal.is_on_diet).length,
      bestDietStreak: streaks.longestStreak,
    };
  }
}
