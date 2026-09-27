import { cache } from "react";
import { cookies } from "next/headers";
import dbConnect from "@/lib/database/dbConnect";
import { getOrCreateSiteSettings } from "@/lib/models/SiteSettings";
import {
  DEFAULT_SITE_SETTINGS,
  serializeSiteSettings,
} from "@/lib/site/defaults";

export const getSiteSettings = cache(async () => {
  try {
    // Reading cookies keeps branding dynamic so an admin save shows up on the next request.
    await cookies();
    await dbConnect();
    const doc = await getOrCreateSiteSettings();
    return serializeSiteSettings(doc);
  } catch (error) {
    console.error("getSiteSettings error:", error);
    return serializeSiteSettings(DEFAULT_SITE_SETTINGS);
  }
});
