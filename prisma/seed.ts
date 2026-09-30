import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // ---------------------------------------
  // 1. Seed Roles
  // ---------------------------------------

  console.log("📌 Seeding roles...");

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: "MEMBER" },
    update: {},
    create: { name: "MEMBER" },
  });

  const guestRole = await prisma.role.upsert({
    where: { name: "GUEST" },
    update: {},
    create: { name: "GUEST" },
  });

  console.log("✅ Roles seeded.");

  // ---------------------------------------
  // 2. Create Users
  // ---------------------------------------

  console.log("👤 Creating users...");

  const users = [];

  for (let i = 0; i < 10; i++) {
    const role =
      i === 0
        ? adminRole
        : i < 8
          ? memberRole
          : guestRole;

    const user = await prisma.user.create({
      data: {
        id: faker.string.nanoid(21),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        emailVerified: faker.datatype.boolean(),
        roleId: role.id,
      },
    });

    users.push(user);
  }

  console.log(`✅ Created ${users.length} users.`);

  // ---------------------------------------
  // 3. Create Transactions
  // ---------------------------------------

  console.log("💳 Creating transactions...");

  const transactions = [];

  for (let i = 0; i < 20; i++) {
    const user = faker.helpers.arrayElement(users);

    const transaction = await prisma.transaction.create({
      data: {
        amount: faker.finance.amount({
          min: 100,
          max: 10000,
          dec: 2,
        }),
        status: faker.helpers.arrayElement([
          "PENDING",
          "SUCCESS",
          "FAILED",
        ]),
        reference: `TXN-${faker.string.alphanumeric(12).toUpperCase()}`,
        userId: user.id,
      },
    });

    transactions.push(transaction);
  }

  console.log(`✅ Created ${transactions.length} transactions.`);

  // ---------------------------------------
  // 4. Create Audit Logs
  // ---------------------------------------

  console.log("📝 Creating audit logs...");

  for (let i = 0; i < 20; i++) {
    const user = faker.helpers.arrayElement(users);

    await prisma.auditLog.create({
      data: {
        action: faker.helpers.arrayElement([
          "USER_LOGIN",
          "TRANSACTION_CREATED",
          "TRANSACTION_UPDATED",
          "PROFILE_UPDATED",
          "PASSWORD_CHANGED",
        ]),
        metadata: {
          source: "faker-seed",
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
        userId: user.id,
      },
    });
  }

  console.log("✅ Created 20 audit logs.");

  // ---------------------------------------
  // 5. Create Email Events
  // ---------------------------------------

  console.log("📧 Creating email events...");

  for (let i = 0; i < 10; i++) {
    const user = faker.helpers.arrayElement(users);

    await prisma.emailEvent.create({
      data: {
        eventId: faker.string.uuid(),
        type: faker.helpers.arrayElement([
          "email.sent",
          "email.delivered",
          "email.bounced",
        ]),
        emailId: faker.string.uuid(),
        payload: {
          source: "faker-seed",
          recipient: user.email,
          timestamp: new Date().toISOString(),
        },
        userId: user.id,
      },
    });
  }

  console.log("✅ Created 10 email events.");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });