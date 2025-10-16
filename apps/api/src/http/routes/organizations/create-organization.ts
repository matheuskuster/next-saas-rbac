import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { Role } from "@/generated/prisma";
import { BadRequestError } from "@/http/_errors";
import { authMiddleware } from "@/http/middlewares/auth";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/organizations",
      {
        schema: {
          tags: [OPENAPI_TAGS.ORGANIZATIONS],
          summary: "Create a new organization",
          security: [{ Bearer: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().default(true),
            avatarUrl: z.url().nullish(),
          }),
          response: {
            201: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { name, domain, shouldAttachUsersByDomain, avatarUrl } =
          request.body;

        if (domain) {
          const organizationWithSameDomain =
            await prisma.organization.findFirst({
              where: {
                domain,
              },
            });

          if (organizationWithSameDomain) {
            throw new BadRequestError(
              "Organization with same domain already exists"
            );
          }
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            ownerId: userId,
            slug: slugify(name),
            domain,
            shouldAttachUsersByDomain,
            avatarUrl,
            members: {
              create: {
                userId,
                role: Role.ADMIN,
              },
            },
          },
        });

        return reply.status(201).send({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        });
      }
    );
}
