// api/ingredients/route.ts

import { NextApiRequest } from "next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextApiRequest) {
  try {
    const ingredients = await prisma.ingredient.findMany();
    return NextResponse.json(ingredients, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Error fetching ingredients" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextApiRequest) {
  try {
    const { name } = req.body;
    const ingredient = await prisma.ingredient.create({
      data: { name },
    });
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Error creating ingredient" },
      { status: 500 }
    );
  }
}

export async function OTHER(req: NextApiRequest) {
  return NextResponse.json(
    { error: `Method ${req.method} Not Allowed` },
    { status: 405 }
  );
}
