import dbConnect from "@/lib/database/dbConnect";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth/auth";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const { name, description, image, isActive } = await request.json();

    if (!name || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const category = await Category.findById(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const normalizedName = name.trim();
    const slug = normalizedName.toLowerCase().replace(/\s+/g, "-");

    const duplicateCategory = await Category.findOne({
      slug,
      _id: { $ne: id },
    });

    if (duplicateCategory) {
      return Response.json(
        {
          success: false,
          message: "A category with this name already exists",
        },
        { status: 409 },
      );
    }

    category.name = normalizedName;
    category.slug = slug;
    category.description = description?.trim() || "";

    if (image !== undefined) {
      category.image = image;
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    return Response.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Category permanently deleted",
    });
  } catch (error) {
    console.error("Delete category error:", error);

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
