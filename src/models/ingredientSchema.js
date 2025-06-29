import { Schema, model } from 'mongoose';

const IngredientSchema = new Schema(
  {
    _id: {
      type: String,
      auto: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 64,
      trim: true,
    },
    desc: {
      type: String,
      required: false,
      trim: true,
    },
    img: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Ingredient = model('Ingredient', IngredientSchema);
