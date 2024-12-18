import type { Knex } from "knex";
import { env } from "./src/libs/dotenv";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: env.DATABASE_URL,
    migrations: {
      tableName: "knex_migrations",
      directory: "./db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },

  staging: {
    client: "mysql2",
    connection: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },

  production: {
    client: "mysql2",
    connection: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
};

export default config;
