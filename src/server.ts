import { app } from "./app";
import { env } from "./libs/dotenv";
import { checkDatabaseConnection } from "./libs/knex";

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    await app.listen({ port: env.PORT });
  } catch (error) {
    app.log.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
