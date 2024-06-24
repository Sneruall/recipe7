"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { sanityFetch, client } from "../../utils/sanity/client";
import { Recipe, PlannedMeal, RecipeIngredient } from "../types";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Modal component
function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded shadow-md">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function MealPlannerPage() {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(daysOfWeek);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    console.log("use effect runs");
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
    setIsModalOpen(false); // Close the modal after adding a meal
  };

  const handleRemoveMeal = async (mealId: string, recipeId: string) => {
    try {
      const existingMeal = plannedMeals.find((meal) => meal._id === mealId);
      if (!existingMeal) {
        console.error(`Meal with ID ${mealId} not found.`);
        return;
      }

      const updatedRecipes = existingMeal.recipes
        .filter((recipe) => recipe._id !== recipeId)
        .map((recipe) => ({
          ...recipe, // Spread the recipe to include all its properties
          _key: recipe._key ?? uuidv4(), // Ensure each recipe has a _key if it doesn't exist
        }));

      // Update Sanity document with the updated recipes
      await client.patch(mealId).set({ recipes: updatedRecipes }).commit();

      // Update local state with the updated recipes (including all details)
      setPlannedMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal._id === mealId ? { ...meal, recipes: updatedRecipes } : meal
        )
      );

      // If updatedRecipes is empty, delete the entire planned meal
      if (updatedRecipes.length === 0) {
        await client.delete(mealId); // Delete the document from Sanity
        setPlannedMeals((prevMeals) =>
          prevMeals.filter((meal) => meal._id !== mealId)
        ); // Remove from local state
      }
    } catch (error) {
      console.error("Error updating or deleting planned meal:", error);
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
    setIsModalOpen(true); // Open the modal when Add Meal button is clicked
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
        isStock: boolean;
        shopName?: string;
      };
    } = {};

    selectedDays.forEach((day) => {
      plannedMeals
        .filter((meal) => meal.day === day)
        .forEach((meal) => {
          meal.recipes.forEach((recipe) => {
            recipe.ingredients
              .filter((ingredient) => ingredient.ingredient.shop) // Filter out ingredients with no shop
              .forEach((ingredient) => {
                const key = `${ingredient.ingredient._id}-${ingredient.unit._id}`;
                const shopName = ingredient.ingredient.shop?.name ?? "No Shop";
                const isStock = ingredient.ingredient.isStock;

                if (
                  (!selectedShop || shopName === selectedShop) &&
                  !ingredientsMap[key]
                ) {
                  ingredientsMap[key] = {
                    ...ingredient,
                    ingredientName: ingredient.ingredient.name,
                    shopName: shopName,
                    isStock: isStock,
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
    <div className="grid xl:grid-cols-6 gap-16">
      <div className="col-span-2 border border-gray-100 rounded-3xl p-4 shadow-md">
        <h2 className="text-xl font-bold mb-8">Grocery List</h2>
        <div>
          <label className="block mb-2">Select Days:</label>
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
          <label className="block mb-2">Select Shop:</label>
          <select
            value={selectedShop ?? ""}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="bg-white border border-gray-300 rounded px-4 py-2 mb-4"
          >
            <option value="">All Shops</option>
            {Array.from(
              new Set(
                recipes.flatMap((recipe) =>
                  recipe.ingredients
                    .filter((ingredient) => ingredient.ingredient.shop) // Filter out ingredients with no shop
                    .map((ingredient) => ingredient.ingredient.shop.name)
                )
              )
            ).map((shop) => (
              <option key={shop} value={shop}>
                {shop}
              </option>
            ))}
          </select>
        </div>
        <div className="">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-sm text-left">
                <th className="px-4 py-2"></th>
                <th className="pr-4 py-2">Ingredient</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Shop</th>
              </tr>
            </thead>
            <tbody>
              {groceryList.map((ingredient) => (
                <tr
                  className="text-xs"
                  key={`${ingredient.ingredient._id}-${ingredient.unit._id}`}
                >
                  <td className="px-4 py-2 m-auto pb-1">
                    <input type="checkbox" />
                  </td>
                  <td className="pr-4 py-2">
                    {ingredient.ingredientName}
                    {ingredient.isStock && " (V)"}
                  </td>
                  <td className="px-4 py-2">
                    {ingredient.amount} {ingredient.unit.value}
                  </td>
                  <td className="px-4 py-2">
                    {ingredient.shopName && ingredient.shopName !== "No Shop"
                      ? ingredient.shopName
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:col-span-4">
        <h2 className="text-4xl font-bold mb-8">Meal Planner</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full hidden lg:table">
            <thead>
              <tr className="bg-gray-100 text-sm text-left">
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Breakfast</th>
                <th className="px-4 py-2">Lunch</th>
                <th className="px-4 py-2">Dinner</th>
                <th className="px-4 py-2">Dessert</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day, index) => {
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
                    {["Breakfast", "Lunch", "Dinner", "Dessert"].map(
                      (mealType) => {
                        const plannedMeal = getPlannedMeal(day, mealType);
                        return (
                          <td key={mealType} className="px-4 py-2">
                            <div className="flex flex-col gap-2">
                              {plannedMeal ? (
                                plannedMeal.recipes.map((recipe) => (
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
                                          plannedMeal._id,
                                          recipe._id
                                        )
                                      }
                                      className="text-red-500"
                                    >
                                      <MinusCircleIcon className="size-6" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400">
                                  No meal planned
                                </span>
                              )}
                              <div>
                                <button
                                  onClick={() =>
                                    openAddMealDialog(day, mealType)
                                  }
                                  className=""
                                >
                                  <PlusCircleIcon className="size-6 text-green-500" />
                                </button>
                              </div>
                            </div>
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Responsive layout for small screens */}
          <div className="lg:hidden">
            {daysOfWeek.map((day, index) => {
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
                <div key={day} className={`mb-4 p-4 ${rowClass} rounded-lg`}>
                  <h3 className="text-xl font-semibold mb-2">{day}</h3>
                  {["Breakfast", "Lunch", "Dinner", "Dessert"].map(
                    (mealType) => {
                      const plannedMeal = getPlannedMeal(day, mealType);
                      return (
                        <div key={mealType} className="mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">
                              {mealType}
                            </span>
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
                                    <span className="text-blue-600">
                                      {recipe.name}
                                    </span>
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleRemoveMeal(
                                        plannedMeal._id,
                                        recipe._id
                                      )
                                    }
                                    className="text-red-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400">
                                No meal planned
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-sm text-left">
              <th className="px-4 py-2"></th>
              <th className="pr-4 py-2">Ingredient</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Shop</th>
            </tr>
          </thead>
          <tbody>
            {groceryList.map((ingredient) => (
              <tr
                className="text-xs"
                key={`${ingredient.ingredient._id}-${ingredient.unit._id}`}
              >
                <td className="px-4 py-2 m-auto pb-1">
                  <input type="checkbox" />
                </td>
                <td className="pr-4 py-2">
                  {ingredient.ingredientName}
                  {ingredient.isStock && " (V)"}
                </td>
                <td className="px-4 py-2">
                  {ingredient.amount} {ingredient.unit.value}
                </td>
                <td className="px-4 py-2">
                  {ingredient.shopName && ingredient.shopName !== "No Shop"
                    ? ingredient.shopName
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
      </Modal>
    </div>
  );
}
