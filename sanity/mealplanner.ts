// mealPlanner.ts
import { defineType, defineField } from "sanity";

export const plannedMeal = defineType({
  name: "plannedMeal",
  title: "Planned Meal",
  type: "document",
  fields: [
    defineField({
      name: "day",
      title: "Day",
      type: "string",
      options: {
        list: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mealType",
      title: "Meal Type",
      type: "string",
      options: {
        list: ["Breakfast", "Lunch", "Dinner", "Dessert"],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "recipe",
      title: "Recipe",
      type: "reference",
      to: [{ type: "recipe" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
});
