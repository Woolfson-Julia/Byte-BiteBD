import { model, Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 64,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = model('Category', categorySchema);
