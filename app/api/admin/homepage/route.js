import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/utils/apiResponse";
import { getOrCreateHomepageContent } from "@/lib/models/HomepageContent";

function normalizeImage(image) {
  if (!image || typeof image !== "object") {
    return { url: "", fileId: "" };
  }
  return {
    url: typeof image.url === "string" ? image.url.trim() : "",
    fileId: typeof image.fileId === "string" ? image.fileId.trim() : "",
  };
}

function normalizeHeroSlides(slides) {
  if (!Array.isArray(slides)) return [];

  return slides.map((slide, index) => ({
    ...(slide._id ? { _id: slide._id } : {}),
    title: typeof slide.title === "string" ? slide.title.trim() : "",
    subtitle: typeof slide.subtitle === "string" ? slide.subtitle.trim() : "",
    price: typeof slide.price === "string" ? slide.price.trim() : "",
    buttonText:
      typeof slide.buttonText === "string" && slide.buttonText.trim()
        ? slide.buttonText.trim()
        : "View Details",
    link:
      typeof slide.link === "string" && slide.link.trim()
        ? slide.link.trim()
        : "/products",
    image: normalizeImage(slide.image),
    isActive: slide.isActive !== false,
    sortOrder:
      typeof slide.sortOrder === "number" ? slide.sortOrder : index,
  }));
}

function normalizeSpecialCollections(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    ...(item._id ? { _id: item._id } : {}),
    title: typeof item.title === "string" ? item.title.trim() : "",
    buttonText:
      typeof item.buttonText === "string" && item.buttonText.trim()
        ? item.buttonText.trim()
        : "Shop Now",
    link:
      typeof item.link === "string" && item.link.trim()
        ? item.link.trim()
        : "/products",
    image: normalizeImage(item.image),
    isActive: item.isActive !== false,
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
  }));
}

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const doc = await getOrCreateHomepageContent();

    return Response.json({
      success: true,
      homepage: doc,
    });
  } catch (error) {
    console.error("GET /api/admin/homepage error:", error);
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return Response.json(
      { success: false, message: "Failed to load homepage content" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    await dbConnect();

    const doc = await getOrCreateHomepageContent();

    if (body.heroSlides !== undefined) {
      doc.heroSlides = normalizeHeroSlides(body.heroSlides);
    }

    if (body.specialCollections !== undefined) {
      doc.specialCollections = normalizeSpecialCollections(
        body.specialCollections,
      );
    }

    await doc.save();

    return Response.json({
      success: true,
      message: "Homepage content updated",
      homepage: doc,
    });
  } catch (error) {
    console.error("PUT /api/admin/homepage error:", error);
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return Response.json(
      { success: false, message: "Failed to update homepage content" },
      { status: 500 },
    );
  }
}
