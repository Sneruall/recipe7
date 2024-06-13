// components/RecipeList.tsx

import { useEffect, useState } from "react";

const RecipeList = ({ onRecipeDeleted }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await fetch("/api/recipes", {
        method: "GET",
      });
      const data = await response.json();
      setRecipes(data);
    };
    fetchRecipes();
  }, [onRecipeDeleted]);

  const handleDelete = async (id) => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      onRecipeDeleted();
    }
  };

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            {recipe.name}
            <button onClick={() => handleDelete(recipe.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeList;
