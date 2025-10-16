import { roleSchema } from "@saas/auth";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authMiddleware } from "@/http/middlewares/auth";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:slug/membership",
      {
        schema: {
          tags: [OPENAPI_TAGS.ORGANIZATIONS],
          summary: "Get a user's membership in an organization",
          security: [{ Bearer: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.string(),
                role: roleSchema,
                organizationId: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const { membership } = await request.getUserMembership(slug);

        return reply.status(200).send({
          membership: {
            id: membership.id,
            role: membership.role,
            organizationId: membership.organizationId,
          },
        });
      }
    );
}
