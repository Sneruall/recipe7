// page.tsx
import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client, sanityFetch } from "../../../utils/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Recipe } from "../../types";

const RECIPE_QUERY = `*[
    _type == "recipe" &&
    slug.current == $slug
  ][0]{
    _id,
    name,
    description,
    ingredients[]{
      _key,
      amount,
      unit,
      ingredient->{
        name
      }
    },
    body,
    image
  }`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function RecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const recipe = await sanityFetch<Recipe>({
    query: RECIPE_QUERY,
    params,
  });

  const { name, description, ingredients, body, image } = recipe;
  const recipeImageUrl = image
    ? urlFor(image)?.width(550).height(310).url()
    : null;

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div className="mb-4">
        <Link href="/">← Back to recipes</Link>
      </div>
      <div className="grid items-top gap-12 sm:grid-cols-2">
        <Image
          src={recipeImageUrl || "https://via.placeholder.com/550x310"}
          alt={name || "Recipe"}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
          height="310"
          width="550"
        />
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-4">
            {name ? (
              <h1 className="text-4xl font-bold tracking-tighter mb-8">
                {name}
              </h1>
            ) : null}
            {description ? (
              <p className="text-gray-500">{description}</p>
            ) : null}
            <h2 className="text-2xl font-semibold">Ingredients</h2>
            <ul className="list-disc pl-5">
              {ingredients.map((ingredient) => (
                <li key={ingredient._key}>
                  {ingredient.ingredient.name} - {ingredient.amount}{" "}
                  {ingredient.unit.value}
                </li>
              ))}
            </ul>
          </div>
          <h2 className="text-2xl font-semibold">Steps</h2>
          {body && body.length > 0 && (
            <div className="prose max-w-none">
              <PortableText value={body} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
