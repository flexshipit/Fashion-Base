import { upload } from "@imagekit/next";

/**
 * Get one-time ImageKit upload auth from our API.
 */
export async function getUploadAuth() {
  const res = await fetch("/api/upload-auth", {
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Upload auth failed");
  }

  return data;
}

/**
 * Upload a single file to ImageKit.
 * Returns { url, fileId } for our Product/Category models.
 */
export async function uploadToImageKit(file, folder = "/products") {
  const auth = await getUploadAuth();

  const result = await upload({
    file,
    fileName: file.name,
    folder,
    publicKey: auth.publicKey,
    signature: auth.signature,
    expire: auth.expire,
    token: auth.token,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
}
