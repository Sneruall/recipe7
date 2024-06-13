"use client";

import { useState } from "react";
import RecipeForm from "./components/RecipeForm";
import Schedule from "./components/Schedule";
import GroceryList from "./components/GroceryList";

const HomePage = () => {
  const [key, setKey] = useState(0); // A key to force re-render the Schedule

  const handleRecipeAdded = () => {
    setKey((prevKey) => prevKey + 1); // Increment the key to re-render the Schedule component
  };

  return (
    <div>
      <main>
        <h1>Recipe Planner</h1>

        <section>
          <h2>Add a New Recipe</h2>
          <RecipeForm onRecipeAdded={handleRecipeAdded} />
        </section>

        <section>
          <h2>Weekly Schedule</h2>
          <Schedule key={key} /> {/* Re-render Schedule when key changes */}
        </section>

        <section>
          <h2>Grocery List</h2>
          <GroceryList />
        </section>
      </main>

      <style jsx>{`
        main {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        section {
          margin-bottom: 40px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
