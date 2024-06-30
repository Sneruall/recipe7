"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sanityFetch, client } from "../../utils/sanity/client";
import { Recipe, PlannedMeal } from "../types";
import { v4 as uuidv4 } from "uuid";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import { Modal } from "./Modal";
import SelectRecipe from "./SelectRecipe";
import GroceryList from "./GroceryList";
import { getDaysOfWeek } from "../utils/dateUtils";

export default function MealPlannerPage() {
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPlannedMeals() {
      const data = await sanityFetch<PlannedMeal[]>({
        query: `*[_type == "plannedMeal"]{
          _id,
          day,
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
                },
                isStock
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
            }
          },
          amount
        }`,
      });
      setRecipes(recipeData);
    }

    fetchPlannedMeals();
    fetchRecipes();
  }, []);

  const handleAddMeal = async () => {
    if (!selectedDay || !selectedRecipeId) {
      console.warn("Day or recipe ID is not selected");
      return;
    }

    const selectedRecipe = recipes.find(
      (recipe) => recipe._id === selectedRecipeId
    );

    if (!selectedRecipe) {
      alert("Recipe not found");
      return;
    }

    const existingMeal = plannedMeals.find((meal) => meal.day === selectedDay);

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
      } catch (error) {
        console.error("Error updating planned meal:", (error as Error).message);
      }
    } else {
      // Create new planned meal
      const newPlannedMeal = {
        _id: `plannedMeal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        _type: "plannedMeal",
        day: selectedDay,
        recipes: [
          { _type: "reference", _ref: selectedRecipe._id, _key: uuidv4() },
        ],
      };

      try {
        await client.create(newPlannedMeal);
        const createdMeal = await sanityFetch<PlannedMeal>({
          query: `*[_id == "${newPlannedMeal._id}"]{
            _id,
            day,
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
      } catch (error) {
        console.error("Error creating planned meal:", (error as Error).message);
      }
    }

    setSelectedDay(null);
    setIsModalOpen(false); // Close the modal after adding a meal
  };

  const handleRemoveMeal = async (mealId: string, recipeId: string) => {
    try {
      const existingMeal = plannedMeals.find((meal) => meal._id === mealId);
      if (!existingMeal) {
        console.error(`Meal with ID ${mealId} not found.`);
        return;
      }

      // Filter out the recipe to be removed
      const updatedRecipes = existingMeal.recipes.filter(
        (recipe) => recipe._id !== recipeId
      );

      if (updatedRecipes.length === 0) {
        // If no recipes left, delete the meal
        await client.delete(mealId);
        setPlannedMeals((prevMeals) =>
          prevMeals.filter((meal) => meal._id !== mealId)
        );
      } else {
        // Update the meal with the remaining recipes
        const updatedReferences = updatedRecipes.map((recipe) => ({
          _type: "reference",
          _ref: recipe._id,
          _key: recipe._key ?? uuidv4(), // Ensure each reference has a unique key
        }));

        await client.patch(mealId).set({ recipes: updatedReferences }).commit();

        // Update the state with full recipe objects
        setPlannedMeals((prevMeals) =>
          prevMeals.map((meal) =>
            meal._id === mealId ? { ...meal, recipes: updatedRecipes } : meal
          )
        );
      }
    } catch (error) {
      console.error("Error updating or deleting planned meal:", error);
    }
  };

  const getPlannedMeal = (day: string) => {
    return plannedMeals.find((meal) => meal.day === day);
  };

  const openAddMealDialog = (day: string) => {
    setSelectedDay(day);
    setSelectedRecipeId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="grid xl:grid-cols-6 gap-16">
      <GroceryList plannedMeals={plannedMeals} recipes={recipes} />
      <div className="lg:col-span-4">
        <h2 className="text-4xl font-bold mb-8">Meal Planner</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full hidden lg:table">
            <thead>
              <tr className="bg-gray-100 text-sm text-left">
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Meals</th>
              </tr>
            </thead>
            <tbody>
              {getDaysOfWeek().map((day, index) => {
                const isCurrentDay =
                  new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  }) === day;
                const rowClass = isCurrentDay
                  ? "bg-green-100"
                  : index % 2 === 0
                    ? "bg-gray-100"
                    : "bg-gray-200";

                return (
                  <tr key={day} className={rowClass}>
                    <td className="px-4 py-2 font-semibold align-top">{day}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-2">
                        {getPlannedMeal(day)?.recipes.map((recipe) => (
                          <div
                            key={recipe._id}
                            className="flex justify-between items-center"
                          >
                            <Link
                              href={`/recipes/${recipe.slug?.current ?? "#"}`}
                            >
                              <span className="text-blue-600">
                                {recipe.name}
                              </span>
                            </Link>
                            <button
                              onClick={() =>
                                handleRemoveMeal(
                                  getPlannedMeal(day)._id,
                                  recipe._id
                                )
                              }
                              className="text-red-500"
                            >
                              <MinusCircleIcon className="size-6" />
                            </button>
                          </div>
                        )) ?? (
                          <span className="text-gray-400">
                            No meals planned
                          </span>
                        )}
                        <div>
                          <button onClick={() => openAddMealDialog(day)}>
                            <PlusCircleIcon className="h-6 w-6 text-green-500" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col lg:hidden gap-2">
          {getDaysOfWeek().map((day) => {
            const isCurrentDay =
              new Date().toLocaleDateString("en-US", {
                weekday: "long",
              }) === day;

            return (
              <div key={day} className="bg-white p-4 shadow rounded-lg">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isCurrentDay ? "text-green-600" : ""
                  }`}
                >
                  {day}
                </h3>
                {getPlannedMeal(day)?.recipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="flex justify-between items-center mb-1"
                  >
                    <Link href={`/recipes/${recipe.slug?.current ?? "#"}`}>
                      <span className="text-blue-600">{recipe.name}</span>
                    </Link>
                    <button
                      onClick={() =>
                        handleRemoveMeal(getPlannedMeal(day)._id, recipe._id)
                      }
                      className="text-red-500"
                    >
                      <MinusCircleIcon className="size-6" />
                    </button>
                  </div>
                )) ?? <span className="text-gray-400">No meals planned</span>}
                <div>
                  <button onClick={() => openAddMealDialog(day)}>
                    <PlusCircleIcon className="h-6 w-6 text-green-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <SelectRecipe
            recipes={recipes}
            handleAddMeal={handleAddMeal}
            selectedRecipeId={selectedRecipeId}
            setSelectedRecipeId={setSelectedRecipeId}
            selectedDay={selectedDay}
          />
        </Modal>
      )}
    </div>
  );
}
