import { defineType, defineField } from "sanity";

export const unit = defineType({
  name: "unit",
  title: "Unit",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
    }),
  ],
});
