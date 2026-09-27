const config = {
  mongodbUri: process.env.MONGODB_URI,
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  // Public URL endpoint (safe to pass to client via RootLayout → ImageKitProvider)
  imagekitUrlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT ||
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  adminEmail: process.env.ADMIN_EMAIL,
  adminName: process.env.ADMIN_NAME || "Admin",
  // ADMIN_PASSWORD is only for seed scripts — never expose to the client
};

export default config;
