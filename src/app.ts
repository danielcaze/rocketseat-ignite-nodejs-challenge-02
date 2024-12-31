import Fastify from "fastify";
import cookie from "@fastify/cookie";
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
    instance.register(mealsController, { prefix: "/meals" });
    instance.register(emailController, { prefix: "/email" });
  },
  { prefix: "/v1" }
);
