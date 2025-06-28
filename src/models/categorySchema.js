import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64 }
});

export const CategoriesCollection = mongoose.model('Category', categorySchema);
