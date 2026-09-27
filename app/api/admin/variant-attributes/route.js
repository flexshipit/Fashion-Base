import dbConnect from "@/lib/database/dbConnect";
import VariantAttribute from "@/lib/models/VariantAttribute";
import { requireAdmin } from "@/lib/auth/auth";

export async function POST(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const { name, values } = await request.json();

    if (!name || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Attribute name is required",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(values) || values.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one attribute value is required",
        },
        { status: 400 },
      );
    }

    const cleanedValues = values.map((value) => value.trim()).filter(Boolean);

    if (cleanedValues.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one valid attribute value is required",
        },
        { status: 400 },
      );
    }

    const normalizedName = name.trim();
    const slug = normalizedName.toLowerCase().replace(/\s+/g, "-");

    const existingAttribute = await VariantAttribute.findOne({
      slug,
    });

    if (existingAttribute) {
      return Response.json(
        {
          success: false,
          message: "An attribute with this name already exists",
        },
        { status: 409 },
      );
    }

    const attribute = await VariantAttribute.create({
      name: normalizedName,
      slug,
      values: cleanedValues.map((value) => ({
        name: value,
        slug: value.toLowerCase().replace(/\s+/g, "-"),
      })),
    });

    return Response.json(
      {
        success: true,
        message: "Variant attribute created successfully",
        attribute,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create variant attribute error:", error);

    if (error.message === "UNAUTHORIZED") {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return Response.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await requireAdmin();

    await dbConnect();

    const attributes = await VariantAttribute.find({
      isActive: true,
    }).sort({
      name: 1,
    });

    return Response.json({
      success: true,
      attributes,
    });
  } catch (error) {
    console.error("Get variant attributes error:", error);

    if (error.message === "UNAUTHORIZED") {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return Response.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
