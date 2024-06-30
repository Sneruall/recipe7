import React, { useState } from "react";
import { RecipeIngredient, Recipe, PlannedMeal } from "../types";
import { getDaysOfWeek } from "../utils/dateUtils";

type Props = {
  plannedMeals: PlannedMeal[];
  recipes: Recipe[];
};

function GroceryList({ plannedMeals, recipes }: Props) {
  const [selectedDays, setSelectedDays] = useState<string[]>(getDaysOfWeek());
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

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

                // Ensure amount is always a valid number
                const amount =
                  typeof ingredient.amount === "number" ? ingredient.amount : 0;

                if (!ingredientsMap[key]) {
                  ingredientsMap[key] = {
                    ...ingredient,
                    ingredientName: ingredient.ingredient.name,
                    shopName: shopName,
                    isStock: isStock,
                    amount: amount, // Initialize with the valid amount
                  };
                } else {
                  if (typeof ingredientsMap[key].amount === "number") {
                    ingredientsMap[key].amount += amount;
                  } else {
                    console.error(
                      "Non-numeric amount detected",
                      ingredientsMap[key],
                      ingredient
                    );
                  }
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

  const handleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="col-span-2 border border-gray-100 rounded-3xl p-4 shadow-md">
      <h2 className="text-xl font-bold mb-8">Grocery List</h2>
      <div>
        <label className="block mb-2">Select Days:</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {getDaysOfWeek().map((day) => (
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
  );
}

export default GroceryList;
