import knex from "knex";
import knexConfig from "../../knexfile";

const config = knexConfig.development;
const db = knex(config);

export const checkDatabaseConnection = async () => {
  try {
    await db.raw("SELECT 1+1 AS result");
    console.log("Database connected successfully");
  } catch (error) {
    throw new Error("Failed to connect to database");
  }
};

export default db;
