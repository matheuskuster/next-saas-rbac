import { FastifyInstance } from "fastify";
import z, { ZodError } from "zod";

import { BadRequestError, NotFoundError, UnauthorizedError } from "./_errors";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      errors: z.flattenError(error).fieldErrors,
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ message: error.message });
  }

  console.error(error);

  return reply.status(500).send({ message: "Internal server error" });
};
