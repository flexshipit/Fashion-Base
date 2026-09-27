import Cart from "@/lib/models/Cart";
import Wishlist from "@/lib/models/Wishlist";
import Order from "@/lib/models/Order";

export async function mergeGuestData({ userId, guestId }) {
  if (!userId || !guestId) {
    return;
  }

  const [guestCart, userCart, guestWishlist, userWishlist] = await Promise.all([
    Cart.findOne({
      guestId,
    }),

    Cart.findOne({
      user: userId,
    }),

    Wishlist.findOne({
      guestId,
    }),

    Wishlist.findOne({
      user: userId,
    }),
  ]);

  /*
   * CART MERGE
   */

  if (guestCart) {
    if (!userCart) {
      guestCart.user = userId;
      guestCart.guestId = undefined;
      guestCart.set("guestId", undefined);
      await guestCart.save();
    } else {
      for (const guestItem of guestCart.items) {
        const existing = userCart.items.find((item) => {
          const sameProduct =
            item.product.toString() === guestItem.product.toString();

          const sameVariant =
            (item.variant?.toString() || null) ===
            (guestItem.variant?.toString() || null);

          return sameProduct && sameVariant;
        });

        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      }

      await userCart.save();

      await Cart.deleteOne({
        _id: guestCart._id,
      });
    }
  }

  /*
   * WISHLIST MERGE
   */

  if (guestWishlist) {
    if (!userWishlist) {
      guestWishlist.user = userId;
      guestWishlist.guestId = undefined;
      guestWishlist.set("guestId", undefined);
      await guestWishlist.save();
    } else {
      for (const guestProduct of guestWishlist.products) {
        const exists = userWishlist.products.some(
          (productId) => productId.toString() === guestProduct.toString(),
        );

        if (!exists) {
          userWishlist.products.push(guestProduct);
        }
      }

      await userWishlist.save();

      await Wishlist.deleteOne({
        _id: guestWishlist._id,
      });
    }
  }

  /*
   * Attach guest orders to this user so they appear in /orders
   */
  await Order.updateMany(
    {
      guestId,
      $or: [{ user: null }, { user: { $exists: false } }],
    },
    {
      $set: { user: userId },
      $unset: { guestId: "" },
    },
  );
}
