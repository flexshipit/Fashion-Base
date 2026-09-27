import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    guestId: {
      type: String,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

wishlistSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  },
);

wishlistSchema.index(
  { guestId: 1 },
  {
    unique: true,
    partialFilterExpression: { guestId: { $type: "string" } },
  },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Wishlist;
  delete mongoose.connection.models.Wishlist;
}

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
