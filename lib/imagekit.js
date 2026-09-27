import config from "@/lib/config";

/**
 * Shared ImageKit public config for server routes.
 * Do NOT put the private key in client code.
 */
export function getImageKitPublicConfig() {
  return {
    publicKey: config.imagekitPublicKey,
    urlEndpoint: config.imagekitUrlEndpoint,
  };
}
