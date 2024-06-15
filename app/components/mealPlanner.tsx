"use client";

// mealPlanner.tsx
import { useState, useEffect } from "react";
import { sanityFetch, client } from "../../utils/sanity/client";
import { MealPlanner, Recipe } from "../types";
import Link from "next/link";

const MEAL_PLANNER_QUERY = `*[_type == "mealPlanner"]{
    _id,
    week,
    days[]{
      day,
      meals{
        breakfast->{_id, name},
        lunch->{_id, name},
        dinner->{_id, name},
        dessert->{_id, name},
      }
    }
  }`;

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_MEALS = {
  breakfast: null,
  lunch: null,
  dinner: null,
  dessert: null,
};

export default function MealPlannerPage() {
  const [mealPlanner, setMealPlanner] = useState<MealPlanner | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchMealPlanner() {
      const data = await sanityFetch<MealPlanner[]>({
        query: MEAL_PLANNER_QUERY,
      });
      if (data && data.length > 0) {
        const fetchedMealPlanner = data[0];
        const updatedDays = DEFAULT_DAYS.map((defaultDay) => {
          const existingDay = fetchedMealPlanner.days.find(
            (day) => day.day === defaultDay
          );
          if (existingDay) {
            return existingDay;
          } else {
            return {
              day: defaultDay,
              meals: { ...DEFAULT_MEALS },
            };
          }
        });

        setMealPlanner({
          ...fetchedMealPlanner,
          days: updatedDays,
        });
      } else {
        // Initialize a default meal planner if none exists
        setMealPlanner({
          _id: "",
          week: "Default Week",
          days: DEFAULT_DAYS.map((day) => ({
            day,
            meals: { ...DEFAULT_MEALS },
          })),
        });
      }
    }

    async function fetchRecipes() {
      const recipeData = await sanityFetch<Recipe[]>({
        query: `*[_type == "recipe"]{_id, name}`,
      });
      setRecipes(recipeData);
    }

    fetchMealPlanner();
    fetchRecipes();
  }, []);

  const handleAddRecipe = async (day: string, mealType: string) => {
    const selectedRecipeId = prompt("Enter recipe ID to add:"); // Simplified recipe selection for the example

    if (selectedRecipeId) {
      const selectedRecipe = recipes.find(
        (recipe) => recipe._id === selectedRecipeId
      );
      if (!selectedRecipe) return alert("Recipe not found");

      const updatedDays = mealPlanner.days.map((d) =>
        d.day === day
          ? { ...d, meals: { ...d.meals, [mealType]: selectedRecipe } }
          : d
      );

      if (mealPlanner._id) {
        await client.patch(mealPlanner._id).set({ days: updatedDays }).commit();
      } else {
        const newMealPlanner = await client.create({
          ...mealPlanner,
          days: updatedDays,
          _type: "mealPlanner",
        });
        setMealPlanner(newMealPlanner);
      }
    }
  };

  const handleRemoveRecipe = async (day: string, mealType: string) => {
    const updatedDays = mealPlanner.days.map((d) =>
      d.day === day ? { ...d, meals: { ...d.meals, [mealType]: null } } : d
    );

    if (mealPlanner._id) {
      await client.patch(mealPlanner._id).set({ days: updatedDays }).commit();
    } else {
      const newMealPlanner = await client.create({
        ...mealPlanner,
        days: updatedDays,
        _type: "mealPlanner",
      });
      setMealPlanner(newMealPlanner);
    }
  };

  if (!mealPlanner) return <div>Loading...</div>;

  return (
    <main className="container mx-auto p-12">
      <h1 className="text-4xl font-bold mb-8">Meal Planner</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {DEFAULT_DAYS.map((defaultDay) => {
          const day = mealPlanner.days.find((d) => d.day === defaultDay);
          return (
            <div key={defaultDay} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">{defaultDay}</h2>
              <ul>
                {["breakfast", "lunch", "dinner", "dessert"].map((mealType) => (
                  <li key={mealType} className="mb-2">
                    <span className="font-semibold">{mealType}: </span>
                    {day.meals[mealType] && day.meals[mealType].name ? (
                      <span>{day.meals[mealType].name}</span>
                    ) : (
                      <span>No recipe selected</span>
                    )}
                    <button
                      onClick={() => handleAddRecipe(defaultDay, mealType)}
                      className="ml-2 text-blue-500"
                    >
                      Add
                    </button>
                    {day.meals[mealType] && (
                      <button
                        onClick={() => handleRemoveRecipe(defaultDay, mealType)}
                        className="ml-2 text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </main>
  );
}
