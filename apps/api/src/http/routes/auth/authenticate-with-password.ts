import { compare } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { UnauthorizedError } from "@/http/_errors";
import { prisma } from "@/lib/prisma";

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        tags: ["auth"],
        summary: "Authenticate with e-mail and password",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            accessToken: z.jwt(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      if (user.passwordHash === null) {
        throw new UnauthorizedError(
          "User does not have a password, use social login instead"
        );
      }

      const isPasswordValid = await compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const token = await reply.jwtSign(
        { sub: user.id },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(200).send({ accessToken: token });
    }
  );
}
