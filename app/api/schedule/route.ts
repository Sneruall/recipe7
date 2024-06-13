import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const schedule = await prisma.schedule.findMany({
    include: {
      recipe: {
        include: { ingredients: true },
      },
    },
  });
  const formattedSchedule = schedule.reduce((acc, curr) => {
    const day = curr.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(curr.recipe);
    return acc;
  }, {});

  return NextResponse.json(formattedSchedule);
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
