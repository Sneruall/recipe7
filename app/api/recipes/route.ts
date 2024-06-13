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
  });
  return NextResponse.json(recipe, { status: 201 });
}
