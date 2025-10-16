import { FastifyInstance } from "fastify";

import { createOrganization } from "./create-organization";
import { getMembership } from "./get-membership";

export function organizationRoutes(app: FastifyInstance) {
  app.register(createOrganization);
  app.register(getMembership);
}
