import { type SchemaTypeDefinition, defineType, defineField } from "sanity";

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
              fields: [
                {
                  name: "name",
                  title: "Name",
                  type: "string",
                },
                {
                  name: "unit",
                  title: "Unit",
                  type: "string",
                },
                {
                  name: "shop",
                  title: "Shop",
                  type: "reference",
                  to: [{ type: "shop" }],
                },
              ],
            },
          ],
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
