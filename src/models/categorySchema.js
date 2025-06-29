// import { model, Schema } from 'mongoose';

// const categorySchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//       maxlength: 64,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export const Category = model('Category', categorySchema);
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64,
  },
});

export const Category = mongoose.model('Category', categorySchema);
