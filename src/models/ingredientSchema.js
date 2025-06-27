import { Schema } from 'mongoose';

export const Ingredient = new Schema({
    id: {
      type: String, // бо в тебе просто рядок ID
      required: true,
    },
    measure: {
      type: String,
      required: true,
    },
  },
  { _id: false } // Не створювати окремий _id для кожного елемента масиву
);
