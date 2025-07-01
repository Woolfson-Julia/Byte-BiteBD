import { Schema, model } from 'mongoose';

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 64,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    area: {
      type: String,
      required: false,
    },
    instructions: {
      type: String,
      required: true,
      maxlength: 1200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
      thumb: {
      type: String,
      required: false,
    },
    time: {
      type: String,
      required: true,
    },
    cals: {
      type: Number,
      required: false,
      min: 1,
      max: 10000,
    },
    ingredients: [
      {
        id: {
          type: String,
          required: true,
        },
        measure: {
          type: String,
          required: true,
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Recipe = model('Recipe', recipeSchema);
