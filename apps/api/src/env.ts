import z from "zod";

import "dotenv/config";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  JWT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
