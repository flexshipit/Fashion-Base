import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity, setGuestCookie } from "@/lib/auth/session";
import { getCheckoutData } from "@/lib/checkout/checkout";

const PAYMENT_METHODS = ["cod", "bkash", "nagad"];

function validatePhone(phone) {
  if (typeof phone !== "string") {
    return false;
  }

  const cleaned = phone.replace(/\s+/g, "");

  return /^01[3-9]\d{8}$/.test(cleaned);
}

/** Cart-based order summary — no delivery form required. */
export async function GET() {
  try {
    const user = await getAuthUser();
    const session = await getSessionIdentity(user);

    await dbConnect();

    const checkout = await getCheckoutData({
      userId: session.type === "user" ? session.id : null,
      guestId: session.type === "guest" ? session.id : null,
      requireDistrict: false,
    });

    if (checkout.error) {
      const response = NextResponse.json(
        {
          success: false,
          message: checkout.error,
        },
        {
          status: checkout.status,
        },
      );

      if (session.shouldSetCookie) {
        setGuestCookie(response, session.id);
      }

      return response;
    }

    const response = NextResponse.json({
      success: true,
      checkout,
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("GET /api/checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load checkout preview",
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

    const { name, phone, district, address, paymentMethod, transactionId } =
      body;

    /*
     * CUSTOMER INFORMATION
     */

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Bangladesh phone number is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!district || typeof district !== "string" || !district.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "District is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Full address is required",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * PAYMENT
     */

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        {
          status: 400,
        },
      );
    }

    const cleanTransactionId =
      typeof transactionId === "string" ? transactionId.trim() : "";

    /*
     * COD MUST NOT REQUIRE
     * TRANSACTION ID
     */

    if (paymentMethod === "cod" && cleanTransactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is not required for Cash on Delivery",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * BKASH / NAGAD MUST HAVE
     * TRANSACTION ID
     */

    if (paymentMethod !== "cod" && !cleanTransactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is required for online payment",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    /*
     * READ CURRENT CART
     * AND CURRENT PRODUCT DATA
     */

    const checkout = await getCheckoutData({
      userId: session.type === "user" ? session.id : null,

      guestId: session.type === "guest" ? session.id : null,

      district,
      requireDistrict: true,
    });

    if (checkout.error) {
      return NextResponse.json(
        {
          success: false,
          message: checkout.error,
        },
        {
          status: checkout.status,
        },
      );
    }

    /*
     * This is NOT an Order yet.
     *
     * It is a trusted checkout
     * preview/calculation.
     */

    const response = NextResponse.json({
      success: true,

      checkout: {
        ...checkout,

        customer: {
          name: name.trim(),

          phone: phone.replace(/\s+/g, "").trim(),

          district: checkout.district,

          address: address.trim(),
        },

        payment: {
          method: paymentMethod,

          /*
           * This is customer-provided
           * proof. It is NOT automatically
           * considered verified.
           */
          transactionId: paymentMethod === "cod" ? "" : cleanTransactionId,

          status: paymentMethod === "cod" ? "pending" : "pending",
        },
      },
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("POST /api/checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to prepare checkout",
      },
      {
        status: 500,
      },
    );
  }
}
