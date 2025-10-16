import { FastifyInstance } from "fastify";

import { authRoutes } from "./auth";
import { organizationRoutes } from "./organizations";

export function routes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(organizationRoutes);
}
