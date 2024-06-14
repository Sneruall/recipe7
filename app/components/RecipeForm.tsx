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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !duration ||
      selectedIngredients.length === 0
    ) {
      alert("Please fill out all fields.");
      return;
    }

    // Check if all selectedIngredients have name and quantity
    const hasIncompleteIngredients = selectedIngredients.some(
      (ingredient) => !ingredient.name || !ingredient.quantity
    );

    if (hasIncompleteIngredients) {
      alert("Please fill out all selected ingredients with name and quantity.");
      return;
    }

    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        duration: parseInt(duration),
        ingredients: selectedIngredients.map(({ id, name, quantity }) => ({
          ingredientId: id,
          name, // Include name in the request
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
    } else {
      const data = await response.json();
      console.error("Error creating recipe:", data.error);
      alert("Failed to create recipe. Please try again.");
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
