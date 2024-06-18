import React from "react";
import { sanityFetch } from "../../utils/sanity/client";
import { Ingredient } from "../types";

// Define the query for fetching stock ingredients
const STOCK_INGREDIENTS_QUERY = `*[_type == "ingredient" && isStock == true]{
  _id,
  name,
  shop->{
    _id,
    name
  },
  isStock
}`;

// Fetch stock ingredients from Sanity
const fetchStockIngredients = async (): Promise<Ingredient[]> => {
  return sanityFetch<Ingredient[]>({
    query: STOCK_INGREDIENTS_QUERY,
  });
};

// Define the props interface
interface StockIngredientsProps {
  stockIngredients: Ingredient[];
}

// Component to display stock ingredients
const StockIngredients: React.FC<StockIngredientsProps> = ({
  stockIngredients,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold mb-4">Stock Ingredients</h2>
      <ul>
        {stockIngredients.map((ingredient) => (
          <li key={ingredient._id}>
            {ingredient.name} - ({ingredient.shop.name})
          </li>
        ))}
      </ul>
    </div>
  );
};

// Fetch data on the server side and render the component
export default async function ServerComponent() {
  const stockIngredients = await fetchStockIngredients();
  return <StockIngredients stockIngredients={stockIngredients} />;
}
