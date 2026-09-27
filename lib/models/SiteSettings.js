import mongoose from "mongoose";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site/defaults";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    fileId: { type: String, default: "" },
  },
  { _id: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "site",
      immutable: true,
    },
    siteName: {
      type: String,
      trim: true,
      default: DEFAULT_SITE_SETTINGS.siteName,
    },
    description: {
      type: String,
      trim: true,
      default: DEFAULT_SITE_SETTINGS.description,
    },
    announcement: {
      type: String,
      trim: true,
      default: DEFAULT_SITE_SETTINGS.announcement,
    },
    footerNote: {
      type: String,
      trim: true,
      default: DEFAULT_SITE_SETTINGS.footerNote,
    },
    logo: { type: imageSchema, default: () => ({ url: "", fileId: "" }) },
    favicon: { type: imageSchema, default: () => ({ url: "", fileId: "" }) },
  },
  { timestamps: true },
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;

export async function getOrCreateSiteSettings() {
  const existing = await SiteSettings.findOne({ key: "site" });
  if (existing) return existing;

  try {
    return await SiteSettings.create({
      key: "site",
      ...DEFAULT_SITE_SETTINGS,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const doc = await SiteSettings.findOne({ key: "site" });
      if (doc) return doc;
    }
    throw error;
  }
}
