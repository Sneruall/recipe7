"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sanityFetch, client } from "../../utils/sanity/client";
import { Recipe, PlannedMeal, RecipeIngredient } from "../types";

export default function MealPlannerPage() {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(daysOfWeek);

  useEffect(() => {
    async function fetchPlannedMeals() {
      const data = await sanityFetch<PlannedMeal[]>({
        query: `*[_type == "plannedMeal"]{
          _id,
          day,
          mealType,
          recipe->{
            _id,
            name,
            slug,
            ingredients[]{
              ingredient->{
                _id,
                name
              },
              unit,
              amount
            }
          }
        }`,
      });
      setPlannedMeals(data);
    }

    async function fetchRecipes() {
      const recipeData = await sanityFetch<Recipe[]>({
        query: `*[_type == "recipe"]{
          _id,
          name,
          ingredients[]{
            ingredient->{
              _id,
              name
            },
            unit,
            amount
          }
        }`,
      });
      setRecipes(recipeData);
    }

    fetchPlannedMeals();
    fetchRecipes();
  }, []);

  const handleAddMeal = async () => {
    if (!selectedDay || !selectedMealType || !selectedRecipeId) return;

    const selectedRecipe = recipes.find(
      (recipe) => recipe._id === selectedRecipeId
    );
    if (!selectedRecipe) return alert("Recipe not found");

    const newPlannedMealId = `plannedMeal_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newPlannedMeal: Omit<PlannedMeal, "recipe"> & {
      recipe: { _type: "reference"; _ref: string };
    } = {
      _id: newPlannedMealId,
      _type: "plannedMeal",
      day: selectedDay,
      mealType: selectedMealType,
      recipe: {
        _type: "reference",
        _ref: selectedRecipe._id,
      },
    };

    try {
      await client.create(newPlannedMeal);
      const createdMeal = await sanityFetch<PlannedMeal>({
        query: `*[_id == "${newPlannedMealId}"]{
          _id,
          day,
          mealType,
          recipe->{
            _id,
            name,
            slug,
            ingredients[]{
              ingredient->{
                _id,
                name
              },
              unit,
              amount
            }
          }
        }[0]`,
      });
      setPlannedMeals([...plannedMeals, createdMeal]);
    } catch (error) {
      console.error("Error creating planned meal:", (error as Error).message);
    } finally {
      setSelectedDay(null);
      setSelectedMealType(null);
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

  const openAddMealDialog = (day: string, mealType: string) => {
    if (getPlannedMeal(day, mealType)) {
      alert("A recipe is already selected for this meal type.");
      return;
    }
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setSelectedRecipeId(null);
  };

  const handleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const generateGroceryList = () => {
    const ingredientsMap: {
      [key: string]: RecipeIngredient & { ingredientName: string };
    } = {};

    selectedDays.forEach((day) => {
      plannedMeals
        .filter((meal) => meal.day === day)
        .forEach((meal) => {
          meal.recipe.ingredients.forEach((ingredient) => {
            const key = `${ingredient.ingredient._id}-${ingredient.unit}`;
            if (ingredientsMap[key]) {
              ingredientsMap[key].amount += ingredient.amount;
            } else {
              ingredientsMap[key] = {
                ...ingredient,
                ingredientName: ingredient.ingredient.name, // Add ingredient name here
              };
            }
          });
        });
    });

    return Object.values(ingredientsMap);
  };

  const groceryList = generateGroceryList();

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">Meal Planner</h2>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white p-4 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">{day}</h2>
            <ul>
              {["Breakfast", "Lunch", "Dinner", "Dessert"].map((mealType) => (
                <li key={mealType} className="mb-2">
                  <span className="font-semibold">{mealType}: </span>
                  {getPlannedMeal(day, mealType) ? (
                    <Link
                      href={`/recipes/${getPlannedMeal(day, mealType)?.recipe.slug.current}`}
                    >
                      <span className="text-blue-500 hover:underline">
                        {getPlannedMeal(day, mealType)?.recipe.name}
                      </span>
                    </Link>
                  ) : (
                    <span>No recipe selected</span>
                  )}
                  {!getPlannedMeal(day, mealType) && (
                    <button
                      onClick={() => openAddMealDialog(day, mealType)}
                      className="ml-2 text-blue-500"
                      disabled={!!getPlannedMeal(day, mealType)}
                    >
                      Add
                    </button>
                  )}
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
            <label>
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => handleDaySelection(day)}
              />
              Include in grocery list
            </label>
          </div>
        ))}
      </div>
      {selectedDay && selectedMealType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Select Recipe for {selectedDay} - {selectedMealType}
            </h2>
            <select
              value={selectedRecipeId || ""}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md mb-4"
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
            <div className="flex justify-end">
              <button
                onClick={handleAddMeal}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedMealType(null);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-4xl font-bold mb-8">Grocery List</h2>
      <ul>
        {groceryList.map((ingredient) => (
          <li key={ingredient.ingredient._id}>
            {ingredient.ingredientName} - {ingredient.amount} {ingredient.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
