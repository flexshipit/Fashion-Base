import dbConnect from "@/lib/database/dbConnect";
import VariantAttribute from "@/lib/models/VariantAttribute";
import { requireAdmin } from "@/lib/auth/auth";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
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

    await dbConnect();

    const attribute = await VariantAttribute.findById(id);

    if (!attribute) {
      return Response.json(
        {
          success: false,
          message: "Variant attribute not found",
        },
        { status: 404 },
      );
    }

    const normalizedName = name.trim();
    const slug = normalizedName.toLowerCase().replace(/\s+/g, "-");

    const duplicateAttribute = await VariantAttribute.findOne({
      slug,
      _id: { $ne: id },
    });

    if (duplicateAttribute) {
      return Response.json(
        {
          success: false,
          message: "An attribute with this name already exists",
        },
        { status: 409 },
      );
    }

    attribute.name = normalizedName;
    attribute.slug = slug;

    // Keep existing value IDs when the name is unchanged
    const existingByName = new Map(
      (attribute.values || []).map((value) => [
        value.name.trim().toLowerCase(),
        value,
      ]),
    );

    attribute.values = cleanedValues.map((valueName) => {
      const existing = existingByName.get(valueName.toLowerCase());

      if (existing) {
        return {
          _id: existing._id,
          name: valueName,
          slug: valueName.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      return {
        name: valueName,
        slug: valueName.toLowerCase().replace(/\s+/g, "-"),
      };
    });

    await attribute.save();

    return Response.json({
      success: true,
      message: "Variant attribute updated successfully",
      attribute,
    });
  } catch (error) {
    console.error("Update variant attribute error:", error);

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

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    await dbConnect();

    const attribute = await VariantAttribute.findByIdAndDelete(id);

    if (!attribute) {
      return Response.json(
        {
          success: false,
          message: "Variant attribute not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Variant attribute permanently deleted",
    });
  } catch (error) {
    console.error("Delete variant attribute error:", error);

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
