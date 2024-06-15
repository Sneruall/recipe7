// types.ts
export interface Ingredient {
  _key: string;
  name: string;
  unit: string;
  shop?: {
    _ref: string;
    _type: string;
  };
}

export interface Recipe {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description: string;
  ingredients: Ingredient[];
  body: any[];
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
}

export interface Shop {
  _id: string;
  name: string;
}
