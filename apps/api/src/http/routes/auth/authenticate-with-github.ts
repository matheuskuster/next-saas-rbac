import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { githubClient } from "@/clients/github-client";
import { AccountProvider } from "@/generated/prisma";
import { BadRequestError } from "@/http/_errors";
import { OPENAPI_TAGS } from "@/lib/openapi-tags";
import { prisma } from "@/lib/prisma";

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/github",
    {
      schema: {
        tags: [OPENAPI_TAGS.AUTH],
        summary: "Authenticate with GitHub",
        body: z.object({
          code: z.string(),
        }),
        response: {
          200: z.object({
            accessToken: z.jwt(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body;

      const githubAccessToken = await githubClient.getAccessToken(code);

      const githubUser = await githubClient.getUser(
        githubAccessToken.accessToken
      );

      if (githubUser.email === null) {
        throw new BadRequestError("GitHub user does not have an email");
      }

      const user = await prisma.user.upsert({
        where: {
          email: githubUser.email,
        },
        create: {
          email: githubUser.email,
          name: githubUser.name,
          avatarUrl: githubUser.avatarUrl,
        },
        update: {
          name: githubUser.name,
          avatarUrl: githubUser.avatarUrl,
        },
      });

      await prisma.account.upsert({
        where: {
          userId_provider: {
            userId: user.id,
            provider: AccountProvider.GITHUB,
          },
        },
        create: {
          userId: user.id,
          provider: AccountProvider.GITHUB,
          providerAccountId: githubUser.id.toString(),
        },
        update: {
          providerAccountId: githubUser.id.toString(),
        },
      });

      const accessToken = await reply.jwtSign(
        { sub: user.id },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(200).send({ accessToken });
    }
  );
}
