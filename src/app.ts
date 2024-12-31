import Fastify from "fastify";
import cookie from "@fastify/cookie";
import path from "path";
import usersController from "./controllers/users.controller";
import mealsController from "./controllers/meals.controller";
import authController from "./controllers/auth.controller";
import emailController from "./controllers/email.controller";

export const app = Fastify({
  logger: true,
});

app.register(cookie);

app.register(
  async (instance) => {
    instance.register(authController, { prefix: "/auth" });
    instance.register(usersController, { prefix: "/users" });
    instance.register(mealsController, { prefix: "/meals" });
    instance.register(emailController, { prefix: "/email" });
  },
  { prefix: "/v1" }
);
