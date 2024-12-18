import Fastify from "fastify";
import { env } from "./libs/dotenv";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.listen({ port: env.PORT });
