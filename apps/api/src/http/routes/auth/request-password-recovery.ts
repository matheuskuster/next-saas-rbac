import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { TokenType } from "@/generated/prisma";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";
import { prisma } from "@/lib/prisma";

const PASSWORD_RECOVERY_TOKEN_EXPIRATION_TIME_MS = 1000 * 60 * 60 * 3; // 3 hours
const PASSWORD_RECOVERY_RESPONSE_MESSAGE =
  "If this email is associated with an account, you will receive an email with a link to reset your password.";

export async function requestPasswordRecovery(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recover",
    {
      schema: {
        tags: [OPENAPI_TAGS.AUTH],
        summary: "Request password recover",
        body: z.object({
          email: z.email(),
        }),
        response: {
          201: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (!userFromEmail) {
        // We don't want to leak the existence of the email
        return reply.status(201).send({
          message: PASSWORD_RECOVERY_RESPONSE_MESSAGE,
        });
      }

      const passwordRecoveryToken = await prisma.token.create({
        data: {
          type: TokenType.PASSWORD_RECOVERY,
          userId: userFromEmail.id,
          expiresAt: new Date(
            Date.now() + PASSWORD_RECOVERY_TOKEN_EXPIRATION_TIME_MS
          ),
        },
      });

      console.log(`Recovery token: ${passwordRecoveryToken.id}`);
      // TODO: Send email with the password recovery token

      return reply.status(201).send({
        message: PASSWORD_RECOVERY_RESPONSE_MESSAGE,
      });
    }
  );
}
