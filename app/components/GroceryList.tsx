// components/GroceryList.tsx

import { useEffect, useState } from "react";

const GroceryList = () => {
  const [schedule, setSchedule] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      const response = await fetch("/api/schedule", {
        method: "GET",
      });
      const data = await response.json();
      setSchedule(data);
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      const allIngredients = {};

      for (const day of selectedDays) {
        for (const recipe of schedule[day] || []) {
          for (const ingredient of recipe.ingredients) {
            if (allIngredients[ingredient.id]) {
              allIngredients[ingredient.id].quantity += ingredient.quantity;
            } else {
              allIngredients[ingredient.id] = { ...ingredient };
            }
          }
        }
      }

      setIngredients(Object.values(allIngredients));
    };

    fetchIngredients();
  }, [selectedDays, schedule]);

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div>
      <h2>Grocery List</h2>
      {Object.keys(schedule).map((day) => (
        <label key={day}>
          <input
            type="checkbox"
            checked={selectedDays.includes(day)}
            onChange={() => handleDayChange(day)}
          />
          {day}
        </label>
      ))}
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            {ingredient.name}: {ingredient.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryList;
