import { FastifyInstance } from "fastify";

import { authRoutes } from "./auth";

export function routes(app: FastifyInstance) {
  app.register(authRoutes);
}
