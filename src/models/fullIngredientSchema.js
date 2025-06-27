import { Schema, model } from 'mongoose';

const fullIngredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 64,
    trim: true,
  },
  desc: {
    type: String,
    required: false,
    maxlength: 300,
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

export const FullIngredient = model('FullIngredient', fullIngredientSchema);



// щоб перевірити, чи інгредієнт існує
