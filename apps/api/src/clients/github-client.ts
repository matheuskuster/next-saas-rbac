import z from "zod";

import { env } from "@/env";
import { parseFetchResponse } from "@/utils/parse-fetch-response";

const githubAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.literal("bearer"),
});

const githubUserResponseSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  email: z.email().nullable(),
  avatar_url: z.url().nullable(),
});

async function getUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseFetchResponse(response, githubUserResponseSchema);
}

async function getAccessToken(code: string) {
  const githubOAuthURL = new URL("https://github.com/login/oauth/access_token");

  githubOAuthURL.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubOAuthURL.searchParams.set("client_secret", env.GITHUB_CLIENT_SECRET);
  githubOAuthURL.searchParams.set("code", code);

  const response = await fetch(githubOAuthURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseFetchResponse(response, githubAccessTokenResponseSchema);
}

export const githubClient = {
  getUser,
  getAccessToken,
};
