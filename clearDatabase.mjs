// clearDatabase.mjs

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    // Delete schedules
    await prisma.schedule.deleteMany({});

    // Delete recipes
    await prisma.recipe.deleteMany({});

    // Delete ingredients (optional, if needed)
    // await prisma.ingredient.deleteMany({});

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
