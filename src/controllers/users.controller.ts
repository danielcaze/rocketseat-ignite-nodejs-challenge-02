import type { FastifyInstance } from "fastify";
import { UsersService } from "../services/users.service";

const usersController = async (fastify: FastifyInstance) => {
  const usersService = new UsersService();

  fastify.get("/", async (req, res) => {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).send(users);
    } catch (error) {
      fastify.log.error(error);
      res.status(500).send({ error: "Failed to fetch users" });
    }
  });
};

export default usersController;
