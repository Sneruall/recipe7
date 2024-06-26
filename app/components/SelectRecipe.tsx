import React from "react";
import { Recipe, PlannedMeal } from "../types";

type Props = {
  selectedDay: string | null;
  selectedRecipeId: string | null;
  setSelectedRecipeId: (id: string | null) => void;
  recipes: Recipe[];
  handleAddMeal: () => void;
};

function SelectRecipe({
  selectedDay,
  recipes,
  handleAddMeal,
  selectedRecipeId,
  setSelectedRecipeId,
}: Props) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        Add Meal for {selectedDay}
      </h2>
      <select
        value={selectedRecipeId ?? ""}
        onChange={(e) => setSelectedRecipeId(e.target.value)}
        className="bg-white border border-gray-300 rounded px-4 py-2 mb-4"
      >
        <option value="" disabled>
          Select a recipe
        </option>
        {recipes.map((recipe) => (
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
