import dbConnect from "@/lib/database/dbConnect";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth/auth";
import { slugify } from "@/lib/utils/slugify";

export async function POST(request) {
  try {
    await requireAdmin();

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

    const normalizedName = name.trim();
    const baseSlug = slugify(normalizedName);

    if (!baseSlug) {
      return Response.json(
        {
          success: false,
          message: "A valid category name is required",
        },
        { status: 400 },
      );
    }

    let slug = baseSlug;
    let counter = 1;
    while (await Category.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      name: normalizedName,
      slug,
      description: description?.trim() || "",
      image: image || {
        url: "",
        fileId: "",
      },
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return Response.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);

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

    const categories = await Category.find().sort({
      name: 1,
    });

    return Response.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

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
