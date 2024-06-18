// StockIngredients.tsx
"use client";

import React, { useEffect, useState } from "react";
import { sanityFetch } from "../../utils/sanity/client";
import { Ingredient, Unit } from "../types";

// Add this query wherever appropriate in your code structure
const STOCK_INGREDIENTS_QUERY = `*[_type == "ingredient" && isStock == true]{
    _id,
    name,
    shop->{
      _id,
      name
    },
    isStock
  }`;

const StockIngredients: React.FC = () => {
  const [stockIngredients, setStockIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchStockIngredients = async () => {
      try {
        const data = await sanityFetch<Ingredient[]>({
          query: STOCK_INGREDIENTS_QUERY,
        });
        setStockIngredients(data);
      } catch (error) {
        console.error("Error fetching stock ingredients:", error);
      }
    };

    fetchStockIngredients();
  }, []);

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

export default StockIngredients;
