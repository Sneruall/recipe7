"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sanityFetch, client } from "../../utils/sanity/client";
import { Recipe, PlannedMeal, RecipeIngredient } from "../types";
import { v4 as uuidv4 } from "uuid"; // Import uuid

export default function MealPlannerPage() {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(daysOfWeek);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlannedMeals() {
      const data = await sanityFetch<PlannedMeal[]>({
        query: `*[_type == "plannedMeal"]{
          _id,
          day,
          mealType,
          recipes[]->{
            _id,
            name,
            slug,
            ingredients[]{
              ingredient->{
                _id,
                name,
                shop->{
                  _id,
                  name
                }
              },
              unit->{
                _id,
                name,
                value
              },
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
              name,
              shop->{
                _id,
                name
              }
            },
            unit->{
              _id,
              name,
              value
            },
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
    if (!selectedDay || !selectedMealType || !selectedRecipeId) {
      console.warn("Day, meal type, or recipe ID is not selected");
      return;
    }

    const selectedRecipe = recipes.find(
      (recipe) => recipe._id === selectedRecipeId
    );

    if (!selectedRecipe) {
      alert("Recipe not found");
      return;
    }

    const existingMeal = plannedMeals.find(
      (meal) => meal.day === selectedDay && meal.mealType === selectedMealType
    );

    console.log("Selected Recipe: ", selectedRecipe);
    console.log("Existing Meal: ", existingMeal);

    if (existingMeal) {
      // Update existing planned meal
      try {
        await client
          .patch(existingMeal._id)
          .setIfMissing({ recipes: [] })
          .append("recipes", [
            { _type: "reference", _ref: selectedRecipe._id, _key: uuidv4() },
          ])
          .commit();
        setPlannedMeals((prevMeals) =>
          prevMeals.map((meal) =>
            meal._id === existingMeal._id
              ? { ...meal, recipes: [...meal.recipes, selectedRecipe] }
              : meal
          )
        );
        console.log("Meal updated:", existingMeal._id);
      } catch (error) {
        console.error("Error updating planned meal:", (error as Error).message);
      }
    } else {
      // Create new planned meal
      const newPlannedMeal = {
        _id: `plannedMeal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        _type: "plannedMeal",
        day: selectedDay,
        mealType: selectedMealType,
        recipes: [
          {
            _type: "reference",
            _ref: selectedRecipe._id,
            _key: uuidv4(),
          },
        ],
      };

      try {
        await client.create(newPlannedMeal);
        const createdMeal = await sanityFetch<PlannedMeal>({
          query: `*[_id == "${newPlannedMeal._id}"]{
            _id,
            day,
            mealType,
            recipes[]->{
              _id,
              name,
              slug,
              ingredients[]{
                ingredient->{
                  _id,
                  name,
                  shop->{
                    _id,
                    name
                  }
                },
                unit->{
                  _id,
                  name,
                  value
                },
                amount
              }
            }
          }[0]`,
        });
        setPlannedMeals([...plannedMeals, createdMeal]);
        console.log("New meal created:", newPlannedMeal._id);
      } catch (error) {
        console.error("Error creating planned meal:", (error as Error).message);
      }
    }

    setSelectedDay(null);
    setSelectedMealType(null);
  };

  const handleRemoveMeal = async (mealId: string, recipeId: string) => {
    const existingMeal = plannedMeals.find((meal) => meal._id === mealId);
    if (!existingMeal) return;

    const updatedRecipes = existingMeal.recipes.filter(
      (recipe) => recipe._id !== recipeId
    );

    if (updatedRecipes.length === 0) {
      await client.delete(mealId);
      setPlannedMeals(plannedMeals.filter((meal) => meal._id !== mealId));
    } else {
      await client.patch(mealId).set({ recipes: updatedRecipes });
      setPlannedMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal._id === mealId ? { ...meal, recipes: updatedRecipes } : meal
        )
      );
    }
  };

  const getPlannedMeal = (day: string, mealType: string) => {
    return plannedMeals.find(
      (meal) => meal.day === day && meal.mealType === mealType
    );
  };

  const openAddMealDialog = (day: string, mealType: string) => {
    console.log("openAdd Meal Dialog, day and mealtype: " + day + mealType);
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setSelectedRecipeId(null);
    console.log(selectedDay, selectedMealType);
  };

  const handleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const generateGroceryList = () => {
    const ingredientsMap: {
      [key: string]: RecipeIngredient & {
        ingredientName: string;
        shopName: string;
      };
    } = {};

    selectedDays.forEach((day) => {
      plannedMeals
        .filter((meal) => meal.day === day)
        .forEach((meal) => {
          meal.recipes.forEach((recipe) => {
            recipe.ingredients.forEach((ingredient) => {
              const key = `${ingredient.ingredient._id}-${ingredient.unit._id}`;
              const shopName = ingredient.ingredient.shop.name;

              if (
                (!selectedShop || shopName === selectedShop) &&
                !ingredientsMap[key]
              ) {
                ingredientsMap[key] = {
                  ...ingredient,
                  ingredientName: ingredient.ingredient.name,
                  shopName: shopName,
                };
              } else if (
                ingredientsMap[key] &&
                (!selectedShop || shopName === selectedShop)
              ) {
                ingredientsMap[key].amount += ingredient.amount;
              }
            });
          });
        });
    });

    return Object.values(ingredientsMap).sort((a, b) =>
      a.ingredientName.localeCompare(b.ingredientName)
    );
  };

  const groceryList = generateGroceryList();

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">Meal Planner</h2>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{day}</h3>
            {["Breakfast", "Lunch", "Dinner", "Dessert"].map((mealType) => {
              const plannedMeal = getPlannedMeal(day, mealType);
              return (
                <div key={mealType} className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{mealType}</span>
                    <button
                      onClick={() => openAddMealDialog(day, mealType)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Add Meal
                    </button>
                  </div>
                  <div className="mt-2">
                    {plannedMeal ? (
                      plannedMeal.recipes.map((recipe) => (
                        <div
                          key={recipe._id}
                          className="flex justify-between items-center"
                        >
                          <Link
                            href={`/recipes/${recipe.slug?.current ?? "#"}`}
                          >
                            <span className="text-blue-600">{recipe.name}</span>
                          </Link>

                          <button
                            onClick={() =>
                              handleRemoveMeal(plannedMeal._id, recipe._id)
                            }
                            className="text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No meal planned</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {selectedDay && selectedMealType && (
        <div>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
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
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Grocery List</h2>
        <div>
          <label className="block text-lg mb-2">Select Days:</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => handleDaySelection(day)}
                className={`px-4 py-2 rounded ${
                  selectedDays.includes(day)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <label className="block text-lg mb-2">Select Shop:</label>
          <select
            value={selectedShop ?? ""}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="bg-white border border-gray-300 rounded px-4 py-2 mb-4"
          >
            <option value="">All Shops</option>
            {Array.from(
              new Set(
                recipes.flatMap((recipe) =>
                  recipe.ingredients.map(
                    (ingredient) => ingredient.ingredient.shop.name
                  )
                )
              )
            ).map((shop) => (
              <option key={shop} value={shop}>
                {shop}
              </option>
            ))}
          </select>
        </div>
        <ul className="list-disc pl-8">
          {groceryList.map((ingredient) => (
            <li key={`${ingredient.ingredient._id}-${ingredient.unit._id}`}>
              {ingredient.amount} {ingredient.unit.name}{" "}
              {ingredient.ingredientName}{" "}
              {ingredient.shopName && <span>({ingredient.shopName})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
