import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { TokenType } from "@/generated/prisma";
import { BadRequestError, UnauthorizedError } from "@/http/_errors";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";
import { prisma } from "@/lib/prisma";

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/reset",
    {
      schema: {
        tags: [OPENAPI_TAGS.AUTH],
        summary: "Reset password",
        body: z.object({
          token: z.uuid(),
          password: z.string().min(6),
        }),
        response: {
          204: z.object({}),
        },
      },
    },
    async (request, reply) => {
      const { token, password } = request.body;

      const passwordRecoveryToken = await prisma.token.findUnique({
        where: {
          id: token,
          type: TokenType.PASSWORD_RECOVERY,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!passwordRecoveryToken) {
        throw new UnauthorizedError(
          "Invalid or expired password recovery token"
        );
      }

      const { user } = passwordRecoveryToken;

      if (user.passwordHash === null) {
        throw new BadRequestError(
          "User does not have a password, use social login instead"
        );
      }

      const passwordHash = await hash(password, 6);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      await prisma.token.delete({
        where: { id: token },
      });

      return reply.status(204).send();
    }
  );
}
