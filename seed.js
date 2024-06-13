// seed.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.recipe.create({
    data: {
      name: "Pasta Carbonara",
      description:
        "Classic Italian pasta dish with eggs, cheese, and pancetta.",
      duration: 30,
      ingredients: {
        create: [
          { ingredient: { connect: { name: "Spaghetti" } }, quantity: 200 },
          { ingredient: { connect: { name: "Eggs" } }, quantity: 2 },
          {
            ingredient: { connect: { name: "Parmesan cheese" } },
            quantity: 50,
          },
          { ingredient: { connect: { name: "Pancetta" } }, quantity: 100 },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      name: "Chicken Tikka Masala",
      description: "Spicy and creamy Indian chicken dish with tomato sauce.",
      duration: 45,
      ingredients: {
        create: [
          {
            ingredient: { connect: { name: "Chicken breast" } },
            quantity: 400,
          },
          { ingredient: { connect: { name: "Yogurt" } }, quantity: 100 },
          { ingredient: { connect: { name: "Tomato" } }, quantity: 300 },
          { ingredient: { connect: { name: "Spices" } }, quantity: 20 },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
