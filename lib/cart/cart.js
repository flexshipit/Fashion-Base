import mongoose from "mongoose";
import Product from "@/lib/models/Product";

export function getUserId(user) {
  return user?.id || user?._id || user?.userId || null;
}

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function getCartQuery(session) {
  if (session.type === "user") {
    return {
      user: session.id,
    };
  }

  return {
    guestId: session.id,
  };
}

export async function getProductForCart(productId, variantId = null) {
  if (!isValidObjectId(productId)) {
    return {
      error: "Invalid product ID",
      status: 400,
    };
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).lean();

  if (!product) {
    return {
      error: "Product not found or inactive",
      status: 404,
    };
  }

  /*
   * SIMPLE PRODUCT
   */
  if (!product.variants || product.variants.length === 0) {
    if (variantId) {
      return {
        error: "This product does not have variants",
        status: 400,
      };
    }

    if (product.salePrice === null || product.salePrice === undefined) {
      return {
        error: "Product sale price is unavailable",
        status: 409,
      };
    }

    if (product.stock === null || product.stock === undefined) {
      return {
        error: "Product stock is unavailable",
        status: 409,
      };
    }

    if (product.stock <= 0) {
      return {
        error: "Product is out of stock",
        status: 409,
      };
    }

    return {
      product,
      variant: null,
      salePrice: product.salePrice,
      stock: product.stock,
      sku: "",
      selectedAttributes: [],
      image: product.images?.[0] || {
        url: "",
        fileId: "",
      },
    };
  }

  /*
   * VARIABLE PRODUCT
   */

  if (!variantId) {
    return {
      error: "Variant is required for this product",
      status: 400,
    };
  }

  if (!isValidObjectId(variantId)) {
    return {
      error: "Invalid variant ID",
      status: 400,
    };
  }

  const variant = product.variants.find(
    (item) => item._id.toString() === variantId.toString(),
  );

  if (!variant) {
    return {
      error: "Variant not found",
      status: 404,
    };
  }

  if (!variant.isActive) {
    return {
      error: "This variant is inactive",
      status: 409,
    };
  }

  if (variant.salePrice === null || variant.salePrice === undefined) {
    return {
      error: "Variant sale price is unavailable",
      status: 409,
    };
  }

  if (variant.stock === null || variant.stock === undefined) {
    return {
      error: "Variant stock is unavailable",
      status: 409,
    };
  }

  if (variant.stock <= 0) {
    return {
      error: "This variant is out of stock",
      status: 409,
    };
  }

  const image = variant.images?.[0] ||
    product.images?.[0] || {
      url: "",
      fileId: "",
    };

  return {
    product,
    variant,
    salePrice: variant.salePrice,
    stock: variant.stock,
    sku: variant.sku,
    selectedAttributes: variant.attributes || [],
    image,
  };
}
