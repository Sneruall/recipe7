import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: true },
  });
  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const { title, description, ingredients } = await request.json();
  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      ingredients: {
        create: ingredients,
      },
    },
    include: { ingredients: true },
  });
  return NextResponse.json(recipe, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { id } = request.query;

  try {
    // Check if the recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: Number(id) },
      include: { ingredients: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if any other recipe is using the ingredients of this recipe
    const usedIngredients = await prisma.recipe.findFirst({
      where: {
        id: { not: Number(id) },
        ingredients: {
          some: {
            id: {
              in: existingRecipe.ingredients.map((ingredient) => ingredient.id),
            },
          },
        },
      },
    });

    if (usedIngredients) {
      return NextResponse.json(
        {
          error: "Cannot delete recipe. Ingredients are used in other recipes.",
        },
        { status: 400 }
      );
    }

    // Delete the recipe
    await prisma.recipe.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the recipe" },
      { status: 500 }
    );
  }
}
