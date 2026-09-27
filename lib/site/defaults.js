export const DEFAULT_SITE_SETTINGS = {
  siteName: "FlexShop",
  description: "Premium fashion and lifestyle shopping",
  announcement: "Best Export Clothing for Women",
  footerNote:
    "Curated fashion and lifestyle pieces — refined browsing, careful details, and a calm checkout.",
  logo: { url: "", fileId: "" },
  favicon: { url: "", fileId: "" },
};

function cleanImage(image) {
  if (!image || typeof image !== "object") {
    return { url: "", fileId: "" };
  }

  return {
    url: typeof image.url === "string" ? image.url.trim() : "",
    fileId: typeof image.fileId === "string" ? image.fileId.trim() : "",
  };
}

export function serializeSiteSettings(doc = {}) {
  const siteName =
    typeof doc.siteName === "string" && doc.siteName.trim()
      ? doc.siteName.trim()
      : DEFAULT_SITE_SETTINGS.siteName;

  const description =
    typeof doc.description === "string" && doc.description.trim()
      ? doc.description.trim()
      : DEFAULT_SITE_SETTINGS.description;

  const announcement =
    typeof doc.announcement === "string"
      ? doc.announcement.trim()
      : DEFAULT_SITE_SETTINGS.announcement;

  const footerNote =
    typeof doc.footerNote === "string" && doc.footerNote.trim()
      ? doc.footerNote.trim()
      : DEFAULT_SITE_SETTINGS.footerNote;

  return {
    siteName,
    description,
    announcement,
    footerNote,
    logo: cleanImage(doc.logo),
    favicon: cleanImage(doc.favicon),
  };
}

/** Keeps a quiet two-tone wordmark when the name is one camel-case word or several words. */
export function splitBrandName(siteName = "") {
  const name = siteName.trim() || DEFAULT_SITE_SETTINGS.siteName;
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return {
      lead: words.slice(0, -1).join(" "),
      accent: words[words.length - 1],
    };
  }

  const camel = name.match(/^(.*?)([A-Z][a-z0-9]+)$/);
  if (camel?.[1]) {
    return { lead: camel[1], accent: camel[2] };
  }

  return { lead: name, accent: "" };
}
