"use client";

import RecipeForm from "./components/RecipeForm";
import Schedule from "./components/Schedule";
import GroceryList from "./components/GroceryList";

const HomePage = () => {
  return (
    <div>
      <main>
        <h1>Recipe Planner</h1>

        <section>
          <h2>Add a New Recipe</h2>
          <RecipeForm />
        </section>

        <section>
          <h2>Weekly Schedule</h2>
          <Schedule />
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
