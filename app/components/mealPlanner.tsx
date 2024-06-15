"use client";

import { useState, useEffect } from "react";
import { sanityFetch, client } from "../../utils/sanity/client";
import { Recipe, PlannedMeal } from "../types";

export default function MealPlannerPage() {
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchPlannedMeals() {
      const data = await sanityFetch<PlannedMeal[]>({
        query: `*[_type == "plannedMeal"]{_id, day, mealType, recipe->{_id, name}}`,
      });
      setPlannedMeals(data);
    }

    async function fetchRecipes() {
      const recipeData = await sanityFetch<Recipe[]>({
        query: `*[_type == "recipe"]{_id, name}`,
      });
      setRecipes(recipeData);
    }

    fetchPlannedMeals();
    fetchRecipes();
  }, []);

  const handleAddMeal = async (day: string, mealType: string) => {
    const selectedRecipeId = prompt("Enter recipe ID to add:"); // Simplified recipe selection for the example

    if (selectedRecipeId) {
      const selectedRecipe = recipes.find(
        (recipe) => recipe._id === selectedRecipeId
      );
      if (!selectedRecipe) return alert("Recipe not found");

      // Generate a unique ID for the new PlannedMeal
      const newPlannedMealId = `plannedMeal_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`;

      const newPlannedMeal: PlannedMeal = {
        _id: newPlannedMealId, // Ensure a unique _id is generated
        _type: "plannedMeal", // Ensure _type is included with the correct value
        day,
        mealType,
        recipe: selectedRecipe,
      };

      // Use client.create with the newPlannedMeal
      try {
        await client.create(newPlannedMeal);
        setPlannedMeals([...plannedMeals, newPlannedMeal]);
      } catch (error) {
        console.error("Error creating planned meal:", error.message);
        // Handle error appropriately, such as showing an alert to the user
      }
    }
  };

  const handleRemoveMeal = async (id: string) => {
    await client.delete(id);
    setPlannedMeals(plannedMeals.filter((meal) => meal._id !== id));
  };

  const getPlannedMeal = (day: string, mealType: string) => {
    return plannedMeals.find(
      (meal) => meal.day === day && meal.mealType === mealType
    );
  };

  return (
    <main className="container mx-auto p-12">
      <h1 className="text-4xl font-bold mb-8">Meal Planner</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
          <div key={day} className="bg-white p-4 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">{day}</h2>
            <ul>
              {["Breakfast", "Lunch", "Dinner", "Dessert"].map((mealType) => (
                <li key={mealType} className="mb-2">
                  <span className="font-semibold">{mealType}: </span>
                  {getPlannedMeal(day, mealType) ? (
                    <span>{getPlannedMeal(day, mealType)?.recipe.name}</span>
                  ) : (
                    <span>No recipe selected</span>
                  )}
                  <button
                    onClick={() => handleAddMeal(day, mealType)}
                    className="ml-2 text-blue-500"
                  >
                    Add
                  </button>
                  {getPlannedMeal(day, mealType) && (
                    <button
                      onClick={() =>
                        handleRemoveMeal(
                          getPlannedMeal(day, mealType)?._id || ""
                        )
                      }
                      className="ml-2 text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
