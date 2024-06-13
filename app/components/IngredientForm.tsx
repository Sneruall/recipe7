// components/IngredientForm.tsx

import { useState } from "react";

const IngredientForm = ({ onIngredientAdded }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setName("");
      onIngredientAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ingredient Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Add Ingredient</button>
    </form>
  );
};

export default IngredientForm;
