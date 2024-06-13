"use client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
      const response = await fetch("/api/recipes");
      const data = await response.json();
      setRecipes(data);
    };
    fetchRecipes();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const newSchedule = { ...schedule };
    const [movedRecipe] = newSchedule[result.source.droppableId].splice(
      result.source.index,
      1
    );
    newSchedule[result.destination.droppableId].splice(
      result.destination.index,
      0,
      movedRecipe
    );

    setSchedule(newSchedule);

    await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day: result.destination.droppableId,
        recipeId: movedRecipe.id,
      }),
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {Object.keys(schedule).map((day) => (
        <Droppable droppableId={day} key={day}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{day}</h2>
              {schedule[day].map((recipe, index) => (
                <Draggable
                  key={recipe.id}
                  draggableId={recipe.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {recipe.title}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default Schedule;
