import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const schedule = await prisma.schedule.findMany({
    include: { recipe: true },
  });
  return NextResponse.json(schedule);
}

export async function POST(request: NextRequest) {
  const { day, recipeId } = await request.json();
  const scheduledRecipe = await prisma.schedule.create({
    data: {
      day,
      recipeId,
    },
  });
  return NextResponse.json(scheduledRecipe, { status: 201 });
}
