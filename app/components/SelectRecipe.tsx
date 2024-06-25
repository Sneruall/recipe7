import React from "react";
import { Recipe, PlannedMeal } from "../types";

type Props = {
  selectedDay: string | null;
  selectedMealType: string | null;
  selectedRecipeId: string | null;
  setSelectedRecipeId: (id: string | null) => void;
  recipes: Recipe[];
  plannedMeals: PlannedMeal[];
  handleAddMeal: () => void;
};

function SelectRecipe({
  selectedDay,
  selectedMealType,
  selectedRecipeId,
  setSelectedRecipeId,
  recipes,
  plannedMeals,
  handleAddMeal,
}: Props) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        Add Meal for {selectedDay} - {selectedMealType}
      </h2>
      <select
        value={selectedRecipeId ?? ""}
        onChange={(e) => setSelectedRecipeId(e.target.value)}
        className="bg-white border border-gray-300 rounded px-4 py-2 mb-4"
      >
        <option value="" disabled>
          Select a recipe
        </option>
        {recipes
          .filter((recipe) => {
            // Check if recipe is already selected for the current day and meal type
            const existingMeal = plannedMeals.find(
              (meal) =>
                meal.day === selectedDay && meal.mealType === selectedMealType
            );
            if (existingMeal) {
              return !existingMeal.recipes.some((r) => r._id === recipe._id);
            }
            return true; // Show all recipes if no existing meal found
          })
          .map((recipe) => (
            <option key={recipe._id} value={recipe._id}>
              {recipe.name}
            </option>
          ))}
      </select>

      <button
        onClick={handleAddMeal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Meal
      </button>
    </>
  );
}

export default SelectRecipe;
