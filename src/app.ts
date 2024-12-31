import Fastify from "fastify";
import cookie from "@fastify/cookie";
import mealController from "./controllers/meal.controller";
import authController from "./controllers/auth.controller";
import emailController from "./controllers/email.controller";

export const app = Fastify({
  logger: true,
});

app.register(cookie);

app.register(
  async (instance) => {
    instance.register(authController, { prefix: "/auth" });
    instance.register(mealController, { prefix: "/meal" });
    instance.register(emailController, { prefix: "/email" });
  },
  { prefix: "/v1" }
);
