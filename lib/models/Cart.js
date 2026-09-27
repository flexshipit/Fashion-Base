import mongoose from "mongoose";

const cartAttributeSchema = new mongoose.Schema(
  {
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
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

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
     * Sale price snapshot.
     *
     * This is only a cart snapshot.
     * Checkout always re-reads the current salePrice
     * from the Product document before creating an order.
     */
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sku: {
      type: String,
      trim: true,
      default: "",
    },

    selectedAttributes: {
      type: [cartAttributeSchema],
      default: [],
    },

    image: {
      url: {
        type: String,
        default: "",
      },

      fileId: {
        type: String,
        default: "",
      },
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Do NOT default to null — sparse unique indexes treat null as a real value
    },

    guestId: {
      type: String,
      // Do NOT default to null — same reason as user above
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  },
);

cartSchema.index(
  { guestId: 1 },
  {
    unique: true,
    partialFilterExpression: { guestId: { $type: "string" } },
  },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Cart;
  delete mongoose.connection.models.Cart;
}

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
