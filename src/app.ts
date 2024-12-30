import Fastify from "fastify";
import cookie from "@fastify/cookie";
import usersController from "./controllers/users.controller";
import mealsController from "./controllers/meals.controller";
import authController from "./controllers/auth.controller";

export const app = Fastify({
  logger: true,
});

app.register(cookie);
app.register(authController, { prefix: "/auth" });
app.register(usersController, { prefix: "/users" });
app.register(mealsController, { prefix: "/meals" });
