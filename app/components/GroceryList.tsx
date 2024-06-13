"use client";
import { useEffect, useState } from "react";

const GroceryList = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      const response = await fetch("/api/schedule");
      const schedule = await response.json();

      let allIngredients = [];
      for (const item of schedule) {
        allIngredients = [...allIngredients, ...item.recipe.ingredients];
      }

      setIngredients(allIngredients);
    };

    fetchSchedule();
  }, []);

  const ingredientMap = ingredients.reduce((acc, ingredient) => {
    if (acc[ingredient.name]) {
      acc[ingredient.name].quantity += `, ${ingredient.quantity}`;
    } else {
      acc[ingredient.name] = {
        name: ingredient.name,
        quantity: ingredient.quantity,
      };
    }
    return acc;
  }, {});

  return (
    <ul>
      {Object.values(ingredientMap).map((ingredient, index) => (
        <li key={index}>
          {ingredient.name}: {ingredient.quantity}
        </li>
      ))}
    </ul>
  );
};

export default GroceryList;
