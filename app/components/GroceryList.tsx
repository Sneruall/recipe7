import React, { useEffect, useState } from "react";

const GroceryList = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/schedule");
        const schedule = await response.json();

        let allIngredients = [];

        // Iterate over each day's recipes in the schedule
        Object.values(schedule).forEach((recipes) => {
          recipes.forEach((recipe) => {
            // Iterate over each ingredient in the recipe
            recipe.ingredients.forEach((ingredient) => {
              // Check if the ingredient already exists in allIngredients
              const existingIngredient = allIngredients.find(
                (i) => i.name === ingredient.name
              );

              if (existingIngredient) {
                // If exists, update quantity
                existingIngredient.quantity += `, ${ingredient.quantity}`;
              } else {
                // If not exists, add to allIngredients
                allIngredients.push({ ...ingredient });
              }
            });
          });
        });

        // Set the combined list of ingredients
        setIngredients(allIngredients);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div>
      <h2>Grocery List</h2>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.name}: {ingredient.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryList;
