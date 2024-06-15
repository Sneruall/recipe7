import { SchemaTypeDefinition, defineType, defineField } from "sanity";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    defineType({
      name: "recipe",
      title: "Recipe",
      type: "document",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
        }),
        defineField({
          name: "slug",
          title: "Slug",
          type: "slug",
          options: {
            source: "name",
            maxLength: 96,
          },
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "array",
          of: [
            {
              type: "block",
              styles: [{ title: "Normal", value: "normal" }],
              lists: [{ title: "Numbered", value: "number" }],
              marks: {
                decorators: [
                  { title: "Strong", value: "strong" },
                  { title: "Emphasis", value: "em" },
                ],
                annotations: [
                  {
                    name: "link",
                    type: "object",
                    title: "URL",
                    fields: [
                      {
                        name: "href",
                        type: "url",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }),
        defineField({
          name: "ingredients",
          title: "Ingredients",
          type: "array",
          of: [
            {
              type: "object",
              name: "recipeIngredient",
              title: "Recipe Ingredient",
              fields: [
                {
                  name: "ingredient",
                  title: "Ingredient",
                  type: "reference",
                  to: [{ type: "ingredient" }],
                },
                {
                  name: "unit",
                  title: "Unit",
                  type: "string",
                  options: {
                    list: [
                      { title: "Grams", value: "g" },
                      { title: "Kilograms", value: "kg" },
                      { title: "Teaspoons", value: "tsp" },
                      { title: "Tablespoons", value: "tbsp" },
                      { title: "Pieces", value: "pcs" },
                      { title: "Milliliters", value: "ml" },
                      { title: "Liters", value: "l" },
                      { title: "Cups", value: "cup" },
                      { title: "Hands", value: "hand" },
                      // Add more units as needed
                    ],
                  },
                },
                {
                  name: "amount",
                  title: "Amount",
                  type: "number",
                },
              ],
              preview: {
                select: {
                  title: "ingredient.name",
                  subtitle: "amount",
                  unit: "unit",
                },
                prepare({ title, subtitle, unit }) {
                  return {
                    title: `${title} (${subtitle} ${unit})`,
                  };
                },
              },
            },
          ],
        }),
      ],
      preview: {
        select: {
          title: "name",
          subtitle: "description",
        },
      },
    }),
    defineType({
      name: "ingredient",
      title: "Ingredient",
      type: "document",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
        }),
        defineField({
          name: "shop",
          title: "Shop",
          type: "reference",
          to: [{ type: "shop" }],
        }),
      ],
    }),
    defineType({
      name: "shop",
      title: "Shop",
      type: "document",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
        }),
      ],
    }),
  ],
};
