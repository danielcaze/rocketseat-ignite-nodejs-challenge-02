import { FastifyRequest } from "fastify";
import type { User } from "../types/user";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}
