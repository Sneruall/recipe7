// mealPlanner.ts
import { defineType, defineField } from "sanity";

export const mealPlanner = defineType({
  name: "mealPlanner",
  title: "Meal Planner",
  type: "document",
  fields: [
    defineField({
      name: "week",
      title: "Week",
      type: "string", // You can use a date range or a week number
    }),
    defineField({
      name: "days",
      title: "Days",
      type: "array",
      of: [
        {
          type: "object",
          name: "day",
          title: "Day",
          fields: [
            { name: "day", title: "Day", type: "string" },
            {
              name: "meals",
              title: "Meals",
              type: "object",
              fields: [
                {
                  name: "breakfast",
                  title: "Breakfast",
                  type: "reference",
                  to: [{ type: "recipe" }],
                },
                {
                  name: "lunch",
                  title: "Lunch",
                  type: "reference",
                  to: [{ type: "recipe" }],
                },
                {
                  name: "dinner",
                  title: "Dinner",
                  type: "reference",
                  to: [{ type: "recipe" }],
                },
                {
                  name: "dessert",
                  title: "Dessert",
                  type: "reference",
                  to: [{ type: "recipe" }],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
