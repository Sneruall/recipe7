// components/RecipeForm.tsx

import { useState, useEffect } from "react";

const RecipeForm = ({ onRecipeAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const response = await fetch("/api/ingredients", {
        method: "GET",
      });
      const data = await response.json();
      setIngredients(data);
    };
    fetchIngredients();
  }, []);

  const handleAddIngredient = (ingredient) => {
    if (!selectedIngredients.find((i) => i.id === ingredient.id)) {
      setSelectedIngredients([
        ...selectedIngredients,
        { ...ingredient, quantity: 1 },
      ]);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        duration: parseInt(duration),
        ingredients: selectedIngredients.map(({ id, quantity }) => ({
          ingredientId: id,
          quantity,
        })),
      }),
    });
    if (response.ok) {
      setName("");
      setDescription("");
      setDuration("");
      setSelectedIngredients([]);
      onRecipeAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Recipe Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <div>
        <h3>Ingredients</h3>
        {ingredients.map((ingredient) => (
          <div key={ingredient.id}>
            {ingredient.name}{" "}
            <button
              type="button"
              onClick={() => handleAddIngredient(ingredient)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
      <div>
        <h3>Selected Ingredients</h3>
        {selectedIngredients.map((ingredient) => (
          <div key={ingredient.id}>
            {ingredient.name}
            <input
              type="number"
              value={ingredient.quantity}
              onChange={(e) =>
                handleQuantityChange(ingredient.id, parseInt(e.target.value))
              }
            />
          </div>
        ))}
      </div>
      <button type="submit">Save Recipe</button>
    </form>
  );
};

export default RecipeForm;
