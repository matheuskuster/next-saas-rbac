import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/_errors";
import { authMiddleware } from "@/http/middlewares/auth";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";
import { prisma } from "@/lib/prisma";

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/sessions/me",
      {
        schema: {
          tags: [OPENAPI_TAGS.AUTH],
          summary: "Get authenticated user profile",
          security: [{ Bearer: [] }] as const,
          response: {
            200: z.object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.email(),
              avatarUrl: z.url().nullable(),
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
