import Link from "next/link";
import { sanityFetch } from "../utils/sanity/client";
import { Recipe } from "./types";
import MealPlannerPage from "./components/mealPlanner";

const RECIPES_QUERY = `*[_type == "recipe"]{
  _id, 
  name, 
  slug, 
  description, 
  ingredients[]{
    ingredient->{
      _id,
      name,
      shop->{
        _id,
        name
      }
    }, 
    unit->{
      _id,
      name,
      value
    }, 
    amount
  }, 
  body
}|order(_createdAt desc)`;

export default async function IndexPage() {
  const recipes = await sanityFetch<Recipe[]>({ query: RECIPES_QUERY });

  return (
    <main className="flex bg-gray-100 min-h-screen flex-col p-24 gap-12">
      <h1 className="text-5xl font-bold tracking-tighter">
        AWESOME RECEPTEN PLANNER (DOEI NOTION👋)
      </h1>
      <MealPlannerPage />
      <h2 className="text-4xl font-bold tracking-tighter">Recipes</h2>
      <ul className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {recipes.map((recipe) => (
          <li className="bg-white p-4 rounded-lg" key={recipe._id}>
            <Link
              className="hover:underline"
              href={`/recipes/${recipe.slug.current}`}
            >
              <h2 className="text-xl font-semibold">{recipe?.name}</h2>
              <p className="text-gray-500">{recipe?.description}</p>
              <ul>
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.ingredient._id}>
                    {ingredient.ingredient.name} - {ingredient.amount}{" "}
                    {ingredient.unit.value}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
