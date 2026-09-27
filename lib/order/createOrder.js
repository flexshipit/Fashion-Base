import mongoose from "mongoose";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";
import { normalizeDistrict, getDeliveryCharge } from "@/lib/checkout/location";
import {
  generateOrderNumber,
  validatePhone,
  validatePayment,
} from "@/lib/order/order";
import {
  decrementSimpleStock,
  decrementVariantStock,
} from "@/lib/order/stock";

export async function createOrder({
  userId = null,
  guestId = null,
  customer,
  paymentMethod,
  transactionId,
}) {
  if (!userId && !guestId) {
    return {
      error: "Session is required",
      status: 401,
    };
  }

  if (!customer?.name || typeof customer.name !== "string") {
    return {
      error: "Name is required",
      status: 400,
    };
  }

  if (!validatePhone(customer.phone)) {
    return {
      error: "Valid Bangladesh phone number is required",
      status: 400,
    };
  }

  if (!customer?.district || typeof customer.district !== "string") {
    return {
      error: "District is required",
      status: 400,
    };
  }

  if (!customer?.address || typeof customer.address !== "string") {
    return {
      error: "Full address is required",
      status: 400,
    };
  }

  const paymentValidation = validatePayment({
    paymentMethod,
    transactionId,
  });

  if (!paymentValidation.valid) {
    return {
      error: paymentValidation.message,
      status: 400,
    };
  }

  const normalizedDistrict = normalizeDistrict(customer.district);

  if (!normalizedDistrict) {
    return {
      error: "District is required",
      status: 400,
    };
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder = null;

    await session.withTransaction(async () => {
      const cartQuery = userId ? { user: userId } : { guestId };

      const carts = await Cart.findOne(cartQuery).session(session);

      if (!carts || carts.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const productIds = carts.items.map((item) => item.product);

      const products = await Product.find({
        _id: {
          $in: productIds,
        },
      }).session(session);

      const productMap = new Map(
        products.map((product) => [product._id.toString(), product]),
      );

      const orderItems = [];

      let subtotal = 0;

      for (const cartItem of carts.items) {
        const product = productMap.get(cartItem.product.toString());

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (!product.isActive) {
          throw new Error(`PRODUCT_INACTIVE:${product.name}`);
        }

        let variant = null;

        // VARIABLE PRODUCT
        if (product.variants && product.variants.length > 0) {
          if (!cartItem.variant) {
            throw new Error(`VARIANT_MISSING:${product.name}`);
          }

          variant = product.variants.find(
            (item) => item._id.toString() === cartItem.variant.toString(),
          );

          if (!variant) {
            throw new Error(`VARIANT_NOT_FOUND:${product.name}`);
          }

          if (!variant.isActive) {
            throw new Error(`VARIANT_INACTIVE:${product.name}`);
          }

          if (variant.stock === null || variant.stock === undefined) {
            throw new Error(`STOCK_UNAVAILABLE:${product.name}`);
          }

          if (variant.stock < cartItem.quantity) {
            throw new Error(
              `INSUFFICIENT_STOCK:${product.name}:${variant.stock}`,
            );
          }
        } else {
          // SIMPLE PRODUCT
          if (cartItem.variant) {
            throw new Error(`INVALID_VARIANT:${product.name}`);
          }

          if (product.stock === null || product.stock === undefined) {
            throw new Error(`STOCK_UNAVAILABLE:${product.name}`);
          }

          if (product.stock < cartItem.quantity) {
            throw new Error(
              `INSUFFICIENT_STOCK:${product.name}:${product.stock}`,
            );
          }
        }

        /*
         * The actual customer price is always salePrice.
         *
         * For a variable product:
         *   variant.salePrice
         *
         * For a simple product:
         *   product.salePrice
         *
         * We intentionally do not use discountPercent here because
         * salePrice already represents the final selling price.
         */
        const unitPrice = variant ? variant.salePrice : product.salePrice;

        if (unitPrice === null || unitPrice === undefined) {
          throw new Error(`PRICE_UNAVAILABLE:${product.name}`);
        }

        const lineTotal = unitPrice * cartItem.quantity;

        subtotal += lineTotal;

        const selectedAttributes = variant?.attributes || [];

        const image = variant?.images?.[0] ||
          product.images?.[0] || {
            url: "",
            fileId: "",
          };

        orderItems.push({
          product: product._id,

          variant: variant?._id || null,

          productName: product.name,

          productSlug: product.slug,

          sku: variant?.sku || "",

          selectedAttributes,

          image,

          quantity: cartItem.quantity,

          // Snapshot the actual price paid at the time of purchase.
          unitPrice,

          totalPrice: lineTotal,
        });
      }

      const shipping = getDeliveryCharge();

      /*
       * Product discounts are already reflected in salePrice.
       * Therefore they must not be deducted again here.
       */
      const discount = 0;

      const grandTotal = subtotal + shipping - discount;

      const paymentStatus = paymentMethod === "cod" ? "pending" : "pending";

      const orderNumber = generateOrderNumber();

      const order = new Order({
        orderNumber,

        user: userId || null,

        guestId: guestId || null,

        customer: {
          name: customer.name.trim(),

          phone: customer.phone.replace(/\s+/g, "").trim(),

          district: normalizedDistrict,

          address: customer.address.trim(),
        },

        items: orderItems,

        pricing: {
          subtotal,

          shipping,

          discount,

          grandTotal,
        },

        payment: {
          method: paymentMethod,

          transactionId: paymentValidation.transactionId,

          status: paymentStatus,
        },

        status: "pending",

        shipment: {
          status: "pending",
        },
      });

      await order.save({
        session,
      });

      /*
       * Decrement stock only after all products have
       * been validated and the order has been created.
       */
      for (const cartItem of carts.items) {
        const product = productMap.get(cartItem.product.toString());

        const variant = product.variants?.find(
          (item) =>
            cartItem.variant &&
            item._id.toString() === cartItem.variant.toString(),
        );

        if (variant) {
          const ok = await decrementVariantStock({
            productId: product._id,
            variantId: variant._id,
            quantity: cartItem.quantity,
            mongoSession: session,
          });

          if (!ok) {
            throw new Error(`STOCK_CHANGED:${product.name}`);
          }
        } else {
          const ok = await decrementSimpleStock({
            productId: product._id,
            quantity: cartItem.quantity,
            mongoSession: session,
          });

          if (!ok) {
            throw new Error(`STOCK_CHANGED:${product.name}`);
          }
        }
      }

      carts.items = [];

      await carts.save({
        session,
      });

      createdOrder = order.toObject();
    });

    return {
      order: createdOrder,
    };
  } catch (error) {
    console.error("createOrder error:", error);

    if (error.message === "CART_EMPTY") {
      return {
        error: "Your cart is empty",
        status: 400,
      };
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return {
        error: "A product in your cart no longer exists",
        status: 409,
      };
    }

    if (error.message.startsWith("PRODUCT_INACTIVE:")) {
      return {
        error: `${error.message.split(":")[1]} is no longer available`,
        status: 409,
      };
    }

    if (error.message.startsWith("VARIANT_MISSING:")) {
      return {
        error: `Variant selection is missing for ${error.message.split(":")[1]}`,
        status: 409,
      };
    }

    if (error.message.startsWith("VARIANT_NOT_FOUND:")) {
      return {
        error: `Selected variant for ${error.message.split(":")[1]} no longer exists`,
        status: 409,
      };
    }

    if (error.message.startsWith("VARIANT_INACTIVE:")) {
      return {
        error: `Selected variant for ${error.message.split(":")[1]} is no longer available`,
        status: 409,
      };
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, name, stock] = error.message.split(":");

      return {
        error: `${name} has only ${stock} item(s) available`,
        status: 409,
      };
    }

    if (error.message.startsWith("STOCK_UNAVAILABLE:")) {
      return {
        error: `Stock information unavailable for ${error.message.split(":")[1]}`,
        status: 409,
      };
    }

    if (error.message.startsWith("PRICE_UNAVAILABLE:")) {
      return {
        error: `Sale price unavailable for ${error.message.split(":")[1]}`,
        status: 409,
      };
    }

    if (error.message.startsWith("INVALID_VARIANT:")) {
      return {
        error: `Invalid variant for ${error.message.split(":")[1]}`,
        status: 409,
      };
    }

    if (error.message.startsWith("STOCK_CHANGED:")) {
      return {
        error: "Stock changed while creating your order. Please try again.",
        status: 409,
      };
    }

    return {
      error: "Failed to create order",
      status: 500,
    };
  } finally {
    await session.endSession();
  }
}
