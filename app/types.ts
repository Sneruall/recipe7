export interface Ingredient {
  _id: string;
  name: string;
  shop: {
    _id: string;
    name: string;
  };
  isStock: boolean;
}

export interface Unit {
  _id: string;
  name: string;
  value: string;
}

export interface RecipeIngredient {
  ingredient: Ingredient;
  unit: Unit; // Update to reference Unit
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
  _type: string;
  day: string;
  mealType: string;
  recipes: Recipe[];
}

export interface Shop {
  _id: string;
  name: string;
}
