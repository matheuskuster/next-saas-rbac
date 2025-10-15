import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "123456";
const BCRYPT_SALT_ROUNDS = 1;

const SEED_USERS = [
  {
    name: "John Doe",
    email: "john@acme.com",
    avatarUrl: "https://github.com/matheuskuster.png",
  },
  {
    name: "Jane Doe",
    email: "jane@acme.com",
    avatarUrl: "https://github.com/shadcn.png",
  },
  {
    name: "Doe John",
    email: "doe@acme.com",
    avatarUrl: "https://github.com/diego3g.png",
  },
] as const;

type Role = "ADMIN" | "MEMBER" | "BILLING";

interface OrganizationConfig {
  name: string;
  slug: string;
  domain: string;
  memberRoles: [Role, Role, Role];
}

const SEED_ORGANIZATIONS: OrganizationConfig[] = [
  {
    name: "Acme Inc (Admin)",
    slug: "acme-admin",
    domain: "acme-admin.com",
    memberRoles: ["ADMIN", "MEMBER", "MEMBER"],
  },
  {
    name: "Acme Inc (Member)",
    slug: "acme-member",
    domain: "acme-member.com",
    memberRoles: ["MEMBER", "ADMIN", "MEMBER"],
  },
  {
    name: "Acme Inc (Billing)",
    slug: "acme-billing",
    domain: "acme-billing.com",
    memberRoles: ["BILLING", "ADMIN", "MEMBER"],
  },
];

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

async function createUsers(passwordHash: string): Promise<User[]> {
  const users = await prisma.user.createManyAndReturn({
    data: SEED_USERS.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  if (users.length !== SEED_USERS.length) {
    throw new Error(
      `Failed to create all users. Expected ${SEED_USERS.length}, got ${users.length}`
    );
  }

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  }));
}

async function createOrganization(
  config: OrganizationConfig,
  users: User[],
  ownerId: string
) {
  const [user1, user2, user3] = users;

  if (!user1 || !user2 || !user3) {
    throw new Error("Insufficient users provided");
  }

  const generateProjectData = () => ({
    name: faker.lorem.words(3),
    slug: faker.lorem.slug(3),
    description: faker.lorem.paragraph(),
    avatarUrl: faker.image.avatarGitHub(),
    ownerId: faker.helpers.arrayElement([user1.id, user2.id, user3.id]),
  });

  return prisma.organization.create({
    data: {
      name: config.name,
      slug: config.slug,
      domain: config.domain,
      shouldAttachUsersByDomain: true,
      ownerId,
      avatarUrl: faker.image.avatarGitHub(),
      projects: {
        createMany: {
          data: new Array(3).fill(null).map(generateProjectData),
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user1.id, role: config.memberRoles[0] },
            { userId: user2.id, role: config.memberRoles[1] },
            { userId: user3.id, role: config.memberRoles[2] },
          ],
        },
      },
    },
  });
}

async function seed() {
  console.log("🌱 Starting seed...");

  console.log("🧹 Cleaning up existing data...");
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating users...");
  const passwordHash = await hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);
  const users = await createUsers(passwordHash);
  console.log(`✅ Created ${users.length} users`);

  console.log("🏢 Creating organizations...");
  for (const orgConfig of SEED_ORGANIZATIONS) {
    await createOrganization(orgConfig, users, users[0]!.id);
    console.log(`✅ Created organization: ${orgConfig.name}`);
  }

  console.log("🌱 Seed completed successfully!");
}

seed()
  .then(() => {
    console.log("✨ All done!");
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
