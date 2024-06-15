export interface Ingredient {
  _id: string;
  name: string;
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
export interface Meal {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  dessert?: Recipe;
}

export interface Day {
  day: string;
  meals: Meal;
}

export interface MealPlanner {
  _id: string;
  week: string;
  days: Day[];
}

export interface Shop {
  _id: string;
  name: string;
}
