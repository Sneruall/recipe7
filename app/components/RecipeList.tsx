// components/RecipeList.tsx

import { useEffect, useState } from "react";

const RecipeList = ({ onRecipeDeleted }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        // Handle error state appropriately
      }
    };
    fetchRecipes();
  }, [onRecipeDeleted]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onRecipeDeleted();
      } else {
        throw new Error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      // Handle delete error appropriately
    }
  };

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.length === 0 ? (
          <li>No recipes found</li>
        ) : (
          recipes.map((recipe) => (
            <li key={recipe.id}>
              {recipe.name} {/* Ensure 'name' is present in the API response */}
              <button onClick={() => handleDelete(recipe.id)}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RecipeList;
