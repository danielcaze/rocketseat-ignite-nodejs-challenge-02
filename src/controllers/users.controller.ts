import type { FastifyPluginAsync } from "fastify";
import { UsersService } from "../services/users.service";

const usersController: FastifyPluginAsync = async (fastify, opts) => {
  const usersService = new UsersService();

  fastify.get("/", async (request, reply) => {
    try {
      const users = await usersService.getAllUsers();
      reply.status(200).send(users);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch users" });
    }
  });

  fastify.post("/", async (request, reply) => {
    try {
      await usersService.createUser(request.body);
      reply.status(201).send({ message: "User created successfully" });
    } catch (error: any) {
      if (error.name === "CustomZodError" || error.name === "DatabaseError") {
        reply.status(400).send({
          name: error.name,
          message: error.details,
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ error: "Failed to create user" });
      }
    }
  });
};

export default usersController;
