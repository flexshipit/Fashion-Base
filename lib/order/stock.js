import Product from "@/lib/models/Product";

/**
 * Restore (or re-deduct) stock for every line on an order.
 * direction: 1 = restore, -1 = deduct again
 */
export async function adjustOrderStock(order, direction = 1, mongoSession = null) {
  if (!order?.items?.length) return;

  const options = mongoSession ? { session: mongoSession } : {};

  for (const item of order.items) {
    if (!item.product || !item.quantity) continue;

    if (item.variant) {
      await Product.updateOne(
        {
          _id: item.product,
          variants: {
            $elemMatch: {
              _id: item.variant,
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": direction * item.quantity,
          },
        },
        options,
      );
    } else {
      await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: direction * item.quantity,
          },
        },
        options,
      );
    }
  }
}

/**
 * Safe stock decrement for a variant (requires enough stock).
 * Returns true if the variant stock was actually updated.
 */
export async function decrementVariantStock({
  productId,
  variantId,
  quantity,
  mongoSession = null,
}) {
  const options = mongoSession ? { session: mongoSession } : {};

  const result = await Product.updateOne(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          _id: variantId,
          stock: { $gte: quantity },
        },
      },
    },
    {
      $inc: {
        "variants.$.stock": -quantity,
      },
    },
    options,
  );

  return result.modifiedCount === 1;
}

/**
 * Safe stock decrement for a simple product.
 */
export async function decrementSimpleStock({
  productId,
  quantity,
  mongoSession = null,
}) {
  const options = mongoSession ? { session: mongoSession } : {};

  const result = await Product.updateOne(
    {
      _id: productId,
      stock: { $gte: quantity },
    },
    {
      $inc: {
        stock: -quantity,
      },
    },
    options,
  );

  return result.modifiedCount === 1;
}
