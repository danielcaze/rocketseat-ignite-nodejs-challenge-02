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
    postProcessResponse,
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
    postProcessResponse,
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
    postProcessResponse,
  },
};

function postProcessResponse(result: any) {
  if (Array.isArray(result)) {
    return result.map(parseRow);
  }
  return parseRow(result);
}

function parseRow(row: any) {
  if (!row || typeof row !== "object") return row;

  for (const key of Object.keys(row)) {
    if (key.startsWith("is_") && (row[key] === 0 || row[key] === 1)) {
      row[key] = !!row[key];
    }
  }

  return row;
}

export default config;
