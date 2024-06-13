// components/Schedule.tsx

import { useEffect, useState } from "react";

const Schedule = () => {
  const [recipes, setRecipes] = useState([]);
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await fetch("/api/recipes", {
        method: "GET",
      });
      const data = await response.json();
      setRecipes(data);
    };

    const fetchSchedule = async () => {
      const response = await fetch("/api/schedule", {
        method: "GET",
      });
      const data = await response.json();
      setSchedule(data);
    };

    fetchRecipes();
    fetchSchedule();
  }, []);

  const addRecipeToDay = async (recipe, day) => {
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ day, recipeId: recipe.id }),
    });
    if (response.ok) {
      setSchedule((prev) => ({
        ...prev,
        [day]: [...prev[day], recipe],
      }));
    }
  };

  const removeRecipeFromDay = async (recipeId, day) => {
    const response = await fetch(`/api/schedule/${recipeId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setSchedule((prev) => ({
        ...prev,
        [day]: prev[day].filter((recipe) => recipe.id !== recipeId),
      }));
    }
  };

  const renderRecipes = (day) => {
    return recipes.map((recipe) => (
      <option key={recipe.id} value={recipe.id}>
        {recipe.name}
      </option>
    ));
  };

  const handleSelectChange = (e, day) => {
    const recipe = recipes.find((r) => r.id === parseInt(e.target.value));
    if (recipe) {
      addRecipeToDay(recipe, day);
    }
  };

  return (
    <div>
      <h2>Schedule</h2>
      {Object.keys(schedule).map((day) => (
        <div key={day}>
          <h3>{day}</h3>
          <select onChange={(e) => handleSelectChange(e, day)}>
            <option value="">Select a recipe</option>
            {renderRecipes(day)}
          </select>
          <ul>
            {schedule[day].map((recipe) => (
              <li key={recipe.id}>
                {recipe.name}
                <button onClick={() => removeRecipeFromDay(recipe.id, day)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Schedule;
