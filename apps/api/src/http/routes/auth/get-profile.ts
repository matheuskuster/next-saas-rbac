import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/_errors";
import { authMiddleware } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/sessions/me",
      {
        schema: {
          tags: ["auth"],
          summary: "Get authenticated user profile",
          response: {
            200: z.object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string(),
              avatarUrl: z.string().nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
          where: { id: userId },
        });

        if (!user) {
          throw new BadRequestError("User not found");
        }

        return reply.status(200).send({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        });
      }
    );
}
