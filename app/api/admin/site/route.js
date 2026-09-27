import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/utils/apiResponse";
import { getOrCreateSiteSettings } from "@/lib/models/SiteSettings";
import { serializeSiteSettings } from "@/lib/site/defaults";

function normalizeImage(image) {
  if (!image || typeof image !== "object") {
    return { url: "", fileId: "" };
  }

  return {
    url: typeof image.url === "string" ? image.url.trim() : "",
    fileId: typeof image.fileId === "string" ? image.fileId.trim() : "",
  };
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const doc = await getOrCreateSiteSettings();

    return Response.json({
      success: true,
      site: serializeSiteSettings(doc),
    });
  } catch (error) {
    console.error("GET /api/admin/site error:", error);
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return Response.json(
      { success: false, message: "Failed to load store settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const siteName = cleanText(body.siteName, 80);

    if (!siteName) {
      return Response.json(
        { success: false, message: "Page name is required" },
        { status: 400 },
      );
    }

    await dbConnect();
    const doc = await getOrCreateSiteSettings();

    doc.siteName = siteName;
    doc.description = cleanText(body.description, 300);
    doc.announcement = cleanText(body.announcement, 160);
    doc.footerNote = cleanText(body.footerNote, 500);
    doc.logo = normalizeImage(body.logo);
    doc.favicon = normalizeImage(body.favicon);

    await doc.save();

    return Response.json({
      success: true,
      message: "Store settings updated",
      site: serializeSiteSettings(doc),
    });
  } catch (error) {
    console.error("PUT /api/admin/site error:", error);
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return Response.json(
      { success: false, message: "Failed to update store settings" },
      { status: 500 },
    );
  }
}
