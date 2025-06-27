import { Schema, model } from 'mongoose';
import {Ingredient} from "./ingredientSchema.js";

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 64,
    trim: true, //назва
  },
  decr: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true, // короткий опис рецепту
  },
  cookiesTime: {
    type: Number,
    required: true,
    min: 1,
    max: 360, // час приготування в хвилинах
  },
  cals: {
    type: Number,
    required: false,
    min: 1,
    max: 10000, // кількість калорій
  },
  category: {
    type: String,// Назва категорії
    required: true,
},
  ingredients: {
    type: [Ingredient],
    required: true, // масив айдішок та грамовки
  },
  ingredientAmount: {
    type: Number,
    required: true,
    min: 2,
    max: 16, // кількість інгредієнта
  },
  instruction: {
    type: String,
    required: true,
    maxlength: 1200, // детальний опис приготування
  },
  recipeImg: {
    type: String,
    required: false,
    // фотка їдла
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true, // автор рецепту
  },
}, {
  timestamps: true,
});

export const Recipe = model('Recipe', recipeSchema);
