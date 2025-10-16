import { FastifyInstance } from "fastify";

import { authenticateWithPassword } from "./authenticate-with-password";
import { createAccount } from "./create-account";
import { getProfile } from "./get-profile";

export function authRoutes(app: FastifyInstance) {
  app.register(createAccount);
  app.register(authenticateWithPassword);
  app.register(getProfile);
}
