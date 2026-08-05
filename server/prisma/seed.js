const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const roles = [
    {
      name: UserRole.SUPER_ADMIN,
      description: "Full system access",
    },
    {
      name: UserRole.PROJECT_MANAGER,
      description: "Manages projects and teams",
    },
    {
      name: UserRole.EMPLOYEE,
      description: "Works on assigned tasks",
    },
    {
      name: UserRole.CLIENT,
      description: "Client of the software house",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });