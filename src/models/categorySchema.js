import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64,
  },
});

export const Category = model('Category', categorySchema);
