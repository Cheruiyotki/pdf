import { PrismaClient, PlanTier, SubscriptionStatus } from "@prisma/client";
import { hash } from "../src/lib/password.js";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = await hash("demo12345");

  const user = await prisma.user.upsert({
    where: { email: "demo@quickconvert.app" },
    update: {},
    create: {
      email: "demo@quickconvert.app",
      name: "Demo User",
      passwordHash: demoPassword,
      planTier: PlanTier.PREMIUM,
      subscription: {
        create: {
          status: SubscriptionStatus.ACTIVE
        }
      }
    }
  });

  console.log(`Seeded user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
