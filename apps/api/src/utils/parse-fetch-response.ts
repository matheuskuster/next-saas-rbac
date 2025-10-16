import camelcaseKeys, { CamelCaseKeys, ObjectLike } from "camelcase-keys";
import z from "zod";

export async function parseFetchResponse<T extends ObjectLike>(
  response: Response,
  schema: z.ZodSchema<T>
) {
  const parsedResponse = schema.parse(await response.json());
  return camelcaseKeys(
    parsedResponse as ObjectLike
  ) as unknown as CamelCaseKeys<T>;
}
