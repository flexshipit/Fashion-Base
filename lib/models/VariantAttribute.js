import mongoose from "mongoose";

const variantValueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    _id: true,
  },
);

const variantAttributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    values: {
      type: [variantValueSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const VariantAttribute =
  mongoose.models.VariantAttribute ||
  mongoose.model("VariantAttribute", variantAttributeSchema);

export default VariantAttribute;
