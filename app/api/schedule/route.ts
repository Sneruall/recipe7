// pages/api/schedule.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextApiRequest) {
  try {
    const schedule = await prisma.schedule.findMany({
      include: {
        recipe: { include: { ingredients: { include: { ingredient: true } } } },
      },
    });
    const formattedSchedule = schedule.reduce((acc, entry) => {
      if (!acc[entry.day]) acc[entry.day] = [];
      acc[entry.day].push(entry.recipe);
      return acc;
    }, {});
    return NextResponse.json(formattedSchedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Error fetching schedule" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextApiRequest) {
  try {
    const { day, recipeId } = await req.body;
    const existingEntry = await prisma.schedule.findFirst({
      where: { day, recipeId },
    });
    if (existingEntry) return NextResponse.json({}, { status: 400 });

    const newEntry = await prisma.schedule.create({
      data: { day, recipeId },
    });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule entry:", error);
    return NextResponse.json(
      { error: "Error creating schedule entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextApiRequest) {
  try {
    const { id } = req.query;
    await prisma.schedule.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting schedule entry:", error);
    return NextResponse.json(
      { error: "Error deleting schedule entry" },
      { status: 500 }
    );
  }
}
