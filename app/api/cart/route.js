import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Cart from "@/lib/models/Cart";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity, setGuestCookie } from "@/lib/auth/session";
import { getCartQuery, getProductForCart } from "@/lib/cart/cart";

export async function GET() {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    await dbConnect();

    const cart = await Cart.findOne(getCartQuery(session))
      .populate(
        "items.product",
        "name slug images originalPrice salePrice discountPercent stock variants isActive",
      )
      .lean();

    if (!cart) {
      const response = NextResponse.json({
        success: true,
        cart: {
          items: [],
          subtotal: 0,
          itemCount: 0,
          totalQuantity: 0,
        },
      });

      if (session.shouldSetCookie) {
        setGuestCookie(response, session.id);
      }

      return response;
    }

    let subtotal = 0;
    let totalQuantity = 0;

    const items = cart.items.map((item) => {
      const product = item.product;

      let currentSalePrice = item.salePrice;
      let availableStock = 0;
      let isAvailable = false;

      if (product && product.isActive) {
        if (!item.variant) {
          availableStock = product.stock || 0;

          if (product.salePrice !== null && product.salePrice !== undefined) {
            currentSalePrice = product.salePrice;
          }

          isAvailable = availableStock > 0;
        } else {
          const variant = product.variants?.find(
            (variant) => variant._id.toString() === item.variant.toString(),
          );

          if (variant && variant.isActive) {
            availableStock = variant.stock || 0;

            currentSalePrice = variant.salePrice;

            isAvailable = availableStock > 0;
          }
        }
      }

      const priceChanged = Number(currentSalePrice) !== Number(item.salePrice);

      if (isAvailable) {
        subtotal += currentSalePrice * item.quantity;
      }

      totalQuantity += item.quantity;

      return {
        ...item,

        currentSalePrice,

        availableStock,

        isAvailable,

        priceChanged,
      };
    });

    const response = NextResponse.json({
      success: true,

      cart: {
        _id: cart._id,

        items,

        subtotal,

        itemCount: items.length,

        totalQuantity,
      },
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("GET /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    const body = await request.json();

    const { productId, variantId = null, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive integer",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const productData = await getProductForCart(productId, variantId);

    if (productData.error) {
      return NextResponse.json(
        {
          success: false,
          message: productData.error,
        },
        {
          status: productData.status,
        },
      );
    }

    const {
      product,
      variant,
      salePrice,
      stock,
      sku,
      selectedAttributes,
      image,
    } = productData;

    if (parsedQuantity > stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${stock} item(s) available`,
        },
        {
          status: 409,
        },
      );
    }

    let cart = await Cart.findOne(getCartQuery(session));

    if (!cart) {
      cart = new Cart({
        items: [],
      });

      if (session.type === "user") {
        cart.user = session.id;
      } else {
        cart.guestId = session.id;
      }
    }

    const existingItem = cart.items.find((item) => {
      const sameProduct = item.product.toString() === productId.toString();

      const existingVariant = item.variant?.toString() || null;

      const requestedVariant = variantId?.toString() || null;

      return sameProduct && existingVariant === requestedVariant;
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + parsedQuantity;

      if (newQuantity > stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${stock} item(s) available`,
          },
          {
            status: 409,
          },
        );
      }

      existingItem.quantity = newQuantity;

      existingItem.salePrice = salePrice;

      existingItem.sku = sku;

      existingItem.selectedAttributes = selectedAttributes;

      existingItem.image = image;
    } else {
      cart.items.push({
        product: product._id,

        variant: variant?._id || null,

        quantity: parsedQuantity,

        salePrice,

        sku,

        selectedAttributes,

        image,
      });
    }

    await cart.save();

    const response = NextResponse.json({
      success: true,

      message: existingItem
        ? "Cart item quantity updated"
        : "Product added to cart",

      cart,
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("POST /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product to cart",
      },
      {
        status: 500,
      },
    );
  }
}
