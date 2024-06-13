// api/recipes/route.ts

import { NextApiRequest } from "next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextApiRequest) {
  try {
    const recipes = await prisma.recipe.findMany({
      include: { ingredients: { include: { ingredient: true } } },
    });
    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Error fetching recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, duration, ingredients } = await request.json();
    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        duration,
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    });
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Error creating recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextApiRequest) {
  try {
    const { id } = req.query;
    await prisma.recipe.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Error deleting recipe" },
      { status: 500 }
    );
  }
}
