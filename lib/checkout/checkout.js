import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import { normalizeDistrict, getDeliveryCharge } from "@/lib/checkout/location";

export async function getCheckoutData({
  userId = null,
  guestId = null,
  district = "",
  requireDistrict = false,
}) {
  const cartQuery = userId
    ? {
        user: userId,
      }
    : {
        guestId,
      };

  const cart = await Cart.findOne(cartQuery).lean();

  if (!cart || cart.items.length === 0) {
    return {
      error: "Your cart is empty",
      status: 400,
    };
  }

  const normalizedDistrict = normalizeDistrict(district);

  if (requireDistrict && !normalizedDistrict) {
    return {
      error: "District is required",
      status: 400,
    };
  }

  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).lean();

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  const items = [];

  let subtotal = 0;

  let totalQuantity = 0;

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.product.toString());

    if (!product) {
      return {
        error: "A product in your cart no longer exists",
        status: 409,
      };
    }

    if (!product.isActive) {
      return {
        error: `"${product.name}" is no longer available`,
        status: 409,
      };
    }

    let currentSalePrice;

    let availableStock;

    let variant = null;

    let image = product.images?.[0] || cartItem.image || null;

    /*
     * SIMPLE PRODUCT
     */

    if (!product.variants || product.variants.length === 0) {
      if (cartItem.variant) {
        return {
          error: `Invalid variant for "${product.name}"`,
          status: 409,
        };
      }

      currentSalePrice = product.salePrice;

      availableStock = product.stock;
    } else {
      /*
       * VARIABLE PRODUCT
       */

      if (!cartItem.variant) {
        return {
          error: `Variant selection is missing for "${product.name}"`,
          status: 409,
        };
      }

      variant = product.variants.find(
        (item) => item._id.toString() === cartItem.variant.toString(),
      );

      if (!variant) {
        return {
          error: `Selected variant for "${product.name}" no longer exists`,
          status: 409,
        };
      }

      if (!variant.isActive) {
        return {
          error: `Selected variant for "${product.name}" is no longer available`,
          status: 409,
        };
      }

      currentSalePrice = variant.salePrice;

      availableStock = variant.stock;

      image = variant.images?.[0] || product.images?.[0] || cartItem.image || null;
    }

    if (currentSalePrice === null || currentSalePrice === undefined) {
      return {
        error: `Sale price unavailable for "${product.name}"`,
        status: 409,
      };
    }

    if (availableStock === null || availableStock === undefined) {
      return {
        error: `Stock information unavailable for "${product.name}"`,
        status: 409,
      };
    }

    if (availableStock <= 0) {
      return {
        error: `"${product.name}" is out of stock`,
        status: 409,
      };
    }

    if (cartItem.quantity > availableStock) {
      return {
        error: `Only ${availableStock} unit(s) of "${product.name}" are available`,
        status: 409,
      };
    }

    const lineTotal = currentSalePrice * cartItem.quantity;

    subtotal += lineTotal;

    totalQuantity += cartItem.quantity;

    items.push({
      cartItemId: cartItem._id,

      product: {
        _id: product._id,

        name: product.name,

        slug: product.slug,
      },

      variant: variant
        ? {
            _id: variant._id,

            sku: variant.sku,

            attributes: variant.attributes || [],
          }
        : null,

      quantity: cartItem.quantity,

      salePrice: currentSalePrice,

      lineTotal,

      productName: product.name,

      image: image?.url
        ? { url: image.url, fileId: image.fileId || "" }
        : null,

      priceChanged: Number(cartItem.salePrice) !== Number(currentSalePrice),
    });
  }

  const shipping = getDeliveryCharge();

  const discount = 0;

  const grandTotal = subtotal + shipping - discount;

  return {
    cartId: cart._id,

    district: normalizedDistrict || "",

    items,

    pricing: {
      subtotal,

      shipping,

      discount,

      grandTotal,
    },

    totalQuantity,
  };
}
