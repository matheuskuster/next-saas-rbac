import { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

import { prisma } from "@/lib/prisma";

import { UnauthorizedError } from "../_errors";

export const authMiddleware = fastifyPlugin((app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();
        return sub;
      } catch {
        throw new UnauthorizedError("Invalid auth token");
      }
    };

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId();

      const userMembership = await prisma.member.findFirst({
        where: { userId, organization: { slug } },
        include: {
          organization: true,
        },
      });

      if (!userMembership) {
        throw new UnauthorizedError("User not a member of this organization");
      }

      const { organization, ...membership } = userMembership;

      return {
        organization,
        membership,
      };
    };
  });
});
