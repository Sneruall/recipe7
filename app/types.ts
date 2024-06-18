export interface Ingredient {
  _id: string;
  name: string;
  shop: {
    _id: string;
    name: string;
  };
}

export interface RecipeIngredient {
  ingredient: Ingredient;
  unit: string;
  amount: number;
  _key?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  slug: { current: string };
  description: string;
  ingredients: RecipeIngredient[];
  body: any[];
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
}

export interface PlannedMeal {
  _id: string;
  _type: string; // Add _type with the appropriate value
  day: string;
  mealType: string;
  recipe: Recipe;
}

export interface Shop {
  _id: string;
  name: string;
}
