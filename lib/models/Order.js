import mongoose from "mongoose";

const orderAttributeSchema = new mongoose.Schema(
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

const orderItemSchema = new mongoose.Schema(
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

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productSlug: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    selectedAttributes: {
      type: [orderAttributeSchema],
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cod", "bkash", "nagad"],
      required: true,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "paid", "failed"],
      default: "pending",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const shipmentSchema = new mongoose.Schema(
  {
    courier: {
      type: String,
      default: "",
      trim: true,
    },

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "in_transit",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    guestId: {
      type: String,
      default: null,
      index: true,
    },

    customer: {
      type: customerSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      shipping: {
        type: Number,
        required: true,
        min: 0,
      },

      discount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
      index: true,
    },

    shipment: {
      type: shipmentSchema,
      default: () => ({}),
    },

    cancellation: {
      reason: {
        type: String,
        default: "",
        trim: true,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  guestId: 1,
  createdAt: -1,
});

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Order;
  delete mongoose.connection.models.Order;
}

const Order = mongoose.model("Order", orderSchema);

export default Order;
