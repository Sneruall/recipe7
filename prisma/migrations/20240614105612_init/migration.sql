/*
  Warnings:

  - Added the required column `name` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "name" TEXT NOT NULL;
