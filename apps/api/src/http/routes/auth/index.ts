import { FastifyInstance } from "fastify";

import { authenticateWithPassword } from "./authenticate-with-password";
import { createAccount } from "./create-account";
import { getProfile } from "./get-profile";
import { requestPasswordRecovery } from "./request-password-recovery";
import { resetPassword } from "./reset-password";

export function authRoutes(app: FastifyInstance) {
  app.register(createAccount);
  app.register(authenticateWithPassword);
  app.register(getProfile);
  app.register(requestPasswordRecovery);
  app.register(resetPassword);
}
