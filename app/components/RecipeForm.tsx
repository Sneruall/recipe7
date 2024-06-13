"use client";
import { useState } from "react";

const RecipeForm = ({ onRecipeAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
