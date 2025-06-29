import { saveFileToCloudinary } from './saveFileToCloudinary.js';

export const getPhotoUrl = async (file) => {
  if (!file) return null;
  return await saveFileToCloudinary(file);
};
