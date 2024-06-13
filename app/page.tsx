// pages/index.tsx
"use client";

import { useState } from "react";
import IngredientForm from "./components/IngredientForm";
import RecipeForm from "./components/RecipeForm";
import RecipeList from "./components/RecipeList";
import Schedule from "./components/Schedule";
import GroceryList from "./components/GroceryList";

const Home = () => {
  const [ingredientAdded, setIngredientAdded] = useState(0);
  const [recipeAdded, setRecipeAdded] = useState(0);
  const [recipeDeleted, setRecipeDeleted] = useState(0);

  return (
    <div>
      <h1>Meal Planner</h1>
      <IngredientForm
        onIngredientAdded={() => setIngredientAdded((prev) => prev + 1)}
      />
      <RecipeForm onRecipeAdded={() => setRecipeAdded((prev) => prev + 1)} />
      <RecipeList
        onRecipeDeleted={() => setRecipeDeleted((prev) => prev + 1)}
      />
      <Schedule />
      <GroceryList />
    </div>
  );
};

export default Home;
