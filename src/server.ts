import Fastify from "fastify";
import { env } from "./libs/dotenv";
import usersController from "./controllers/users.controller";
import mealsController from "./controllers/meals.controller";

const fastify = Fastify({
  logger: true,
});

fastify.register(usersController, { prefix: "/users" });
fastify.register(mealsController, { prefix: "/meals" });

fastify.listen({ port: env.PORT });
