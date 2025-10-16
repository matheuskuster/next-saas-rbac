import {
  AbilityBuilder,
  type CreateAbility,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import { z } from "zod/v4";

import type { User } from "./models/user";
import { permissions } from "./permissions";
import { projectSubject } from "./subjects/project";
import { userSubject } from "./subjects/user";
import { billingSubject } from "./subjects/billing";
import { inviteSubject } from "./subjects/invite";
import { organizationSubject } from "./subjects/organization";

export * from "./models/user";
export * from "./models/project";
export * from "./models/organization";
export * from "./roles";

const appAbilities = z.union([
  userSubject,
  projectSubject,
  billingSubject,
  inviteSubject,
  organizationSubject,

  z.tuple([z.literal("manage"), z.literal("all")]),
]);

type AppAbilities = z.infer<typeof appAbilities>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permissions for role ${user.role} are not defined`);
  }

  permissions[user.role](user, builder);

  return builder.build({
    detectSubjectType: (subject) => subject.__typename,
  });
}
