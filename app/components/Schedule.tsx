// Import necessary modules
import React, { useEffect, useState } from "react";

// Schedule component
const Schedule = () => {
  // State variables
  const [recipes, setRecipes] = useState([]); // All recipes
  const [schedule, setSchedule] = useState({
    // Weekly schedule
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  // Function to fetch recipes from API
  const fetchRecipes = async () => {
    const response = await fetch("/api/recipes");
    const data = await response.json();
    setRecipes(data);
  };

  // Effect hook to fetch recipes when component mounts
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Function to add recipe to a specific day
  const addRecipeToDay = (recipe, day) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: [...prevSchedule[day], recipe],
    }));
  };

  // Function to remove recipe from a specific day
  const removeRecipeFromDay = (recipeId, day) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: prevSchedule[day].filter((recipe) => recipe.id !== recipeId),
    }));
  };

  // Function to render recipes with add/remove buttons
  const renderRecipes = () => {
    return recipes.map((recipe) => (
      <div key={recipe.id}>
        {recipe.title}
        <button onClick={() => addRecipeToDay(recipe, "Monday")}>
          Add to Monday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Tuesday")}>
          Add to Tuesday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Wednesday")}>
          Add to Wednesday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Thursday")}>
          Add to Thursday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Friday")}>
          Add to Friday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Saturday")}>
          Add to Saturday
        </button>
        <button onClick={() => addRecipeToDay(recipe, "Sunday")}>
          Add to Sunday
        </button>
      </div>
    ));
  };

  // Function to render the schedule with remove buttons
  const renderSchedule = () => {
    return Object.keys(schedule).map((day) => (
      <div key={day}>
        <h2>{day}</h2>
        {schedule[day].map((recipe) => (
          <div key={recipe.id}>
            {recipe.title}
            <button onClick={() => removeRecipeFromDay(recipe.id, day)}>
              Remove from {day}
            </button>
          </div>
        ))}
      </div>
    ));
  };

  // JSX rendering
  return (
    <div>
      <h2>Recipes</h2>
      {renderRecipes()}
      <hr />
      <h2>Schedule</h2>
      {renderSchedule()}
    </div>
  );
};

// Export the Schedule component
export default Schedule;
