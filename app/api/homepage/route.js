import dbConnect from "@/lib/database/dbConnect";
import { getOrCreateHomepageContent } from "@/lib/models/HomepageContent";

function sortActive(items = []) {
  return [...items]
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Public homepage content for storefront. */
export async function GET() {
  try {
    await dbConnect();
    const doc = await getOrCreateHomepageContent();

    return Response.json({
      success: true,
      heroSlides: sortActive(doc.heroSlides || []),
      specialCollections: sortActive(doc.specialCollections || []),
    });
  } catch (error) {
    console.error("GET /api/homepage error:", error);
    return Response.json(
      { success: false, message: "Failed to load homepage content" },
      { status: 500 },
    );
  }
}
