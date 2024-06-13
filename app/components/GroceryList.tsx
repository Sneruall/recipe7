import { useEffect, useState } from "react";

const GroceryList = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
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
                (i) => i.id === ingredient.id
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

    fetchIngredients();
  }, []);

  const handleDeleteIngredient = async (ingredientId) => {
    // Check if the ingredient is used in any recipe
    const response = await fetch(`/api/recipes/ingredient/${ingredientId}`);
    const isUsedInRecipes = await response.json();

    if (!isUsedInRecipes) {
      // If not used in any recipe, delete the ingredient
      const deleteResponse = await fetch(`/api/ingredients/${ingredientId}`, {
        method: "DELETE",
      });
      if (deleteResponse.ok) {
        // Refresh ingredients list
        const updatedIngredients = ingredients.filter(
          (ingredient) => ingredient.id !== ingredientId
        );
        setIngredients(updatedIngredients);
      }
    } else {
      alert("Cannot delete ingredient. It is used in one or more recipes.");
    }
  };

  return (
    <div>
      <h2>Grocery List</h2>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.name}: {ingredient.quantity}{" "}
            <button onClick={() => handleDeleteIngredient(ingredient.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryList;
