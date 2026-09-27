import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    fileId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const variantAttributeSchema = new mongoose.Schema(
  {
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VariantAttribute",
      required: true,
    },

    valueId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    attributeName: {
      type: String,
      required: true,
      trim: true,
    },

    valueName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const productVariantSchema = new mongoose.Schema(
  {
    attributes: {
      type: [variantAttributeSchema],
      default: [],
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: [0, "Original price cannot be negative"],
    },

    salePrice: {
      type: Number,
      required: true,
      min: [0, "Sale price cannot be negative"],
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: {
      type: [productImageSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images: {
      type: [productImageSchema],
      default: [],
    },

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    originalPrice: {
      type: Number,
      required: function () {
        return !this.variants || this.variants.length === 0;
      },
      min: [0, "Original price cannot be negative"],
    },

    salePrice: {
      type: Number,
      required: function () {
        return !this.variants || this.variants.length === 0;
      },
      min: [0, "Sale price cannot be negative"],
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      min: 0,
      default: null,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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

const calculateDiscountPercent = (originalPrice, salePrice) => {
  if (
    originalPrice === undefined ||
    originalPrice === null ||
    salePrice === undefined ||
    salePrice === null ||
    originalPrice <= 0
  ) {
    return 0;
  }

  if (salePrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

productSchema.pre("validate", function () {
  // SIMPLE PRODUCT
  if (!this.variants || this.variants.length === 0) {
    if (
      this.originalPrice !== undefined &&
      this.originalPrice !== null &&
      this.salePrice !== undefined &&
      this.salePrice !== null
    ) {
      if (this.salePrice > this.originalPrice) {
        throw new Error("Sale price cannot be greater than original price.");
      }

      this.discountPercent = calculateDiscountPercent(
        this.originalPrice,
        this.salePrice,
      );
    }
  }

  // VARIABLE PRODUCT
  if (this.variants && this.variants.length > 0) {
    for (const variant of this.variants) {
      if (variant.salePrice > variant.originalPrice) {
        throw new Error(
          `Sale price cannot be greater than original price for variant ${variant.sku}.`,
        );
      }

      variant.discountPercent = calculateDiscountPercent(
        variant.originalPrice,
        variant.salePrice,
      );
    }
  }
});

// In Next.js HMR, mongoose keeps the old compiled model (and old hooks).
// Clear it in development so schema/middleware updates actually apply.
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Product;
  delete mongoose.connection.models.Product;
}

const Product = mongoose.model("Product", productSchema);

export default Product;
