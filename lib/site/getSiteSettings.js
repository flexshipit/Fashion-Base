import { cache } from "react";
import dbConnect from "@/lib/database/dbConnect";
import { getOrCreateSiteSettings } from "@/lib/models/SiteSettings";
import {
  DEFAULT_SITE_SETTINGS,
  serializeSiteSettings,
} from "@/lib/site/defaults";

export const getSiteSettings = cache(async () => {
  try {
    await dbConnect();
    const doc = await getOrCreateSiteSettings();
    return serializeSiteSettings(doc);
  } catch (error) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("getSiteSettings error:", error);
    return serializeSiteSettings(DEFAULT_SITE_SETTINGS);
  }
});
