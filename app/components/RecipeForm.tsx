// RecipeForm.jsx

import { useState } from "react";

const RecipeForm = ({ onRecipeAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, ingredients }),
    });
    if (response.ok) {
      onRecipeAdded(); // Call callback to fetch updated recipes
      setTitle("");
      setDescription("");
      setIngredients([{ name: "", quantity: "" }]);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      onRecipeAdded(); // Refresh recipes list
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {ingredients.map((ingredient, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Ingredient"
            value={ingredient.name}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index].name = e.target.value;
              setIngredients(newIngredients);
            }}
          />
          <input
            type="text"
            placeholder="Quantity"
            value={ingredient.quantity}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index].quantity = e.target.value;
              setIngredients(newIngredients);
            }}
          />
        </div>
      ))}
      <button type="button" onClick={addIngredient}>
        Add Ingredient
      </button>
      <button type="submit">Save Recipe</button>
    </form>
  );
};

export default RecipeForm;
