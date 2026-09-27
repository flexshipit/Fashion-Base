import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const auth = await getAuthUser();

    if (!auth) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await dbConnect();

    const user = await User.findById(auth.userId).select(
      "name email role phone avatar addresses isActive",
    );

    if (!user || !user.isActive) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return Response.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
