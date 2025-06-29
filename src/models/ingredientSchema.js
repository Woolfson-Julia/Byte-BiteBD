import { Schema, mongoose } from 'mongoose';

const IngredientSchema = new Schema({
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
}, {
  timestamps: true,
});

export const Ingredient = mongoose.model('Ingredient', IngredientSchema);


