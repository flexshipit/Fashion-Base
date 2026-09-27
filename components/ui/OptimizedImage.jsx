"use client";

import { Image } from "@imagekit/next";

/**
 * ImageKit-optimized image. Prefer this over raw <img> / next/image.
 * Works with full ImageKit URLs or paths under the provider urlEndpoint.
 */
export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  fill = false,
  className = "",
  sizes,
  transformation,
  priority = false,
  ...rest
}) {
  if (!src || typeof src !== "string") return null;

  const transforms = transformation || [{ quality: 80 }];

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes || "100vw"}
        transformation={transforms}
        priority={priority}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 800}
      className={className}
      sizes={sizes}
      transformation={transforms}
      priority={priority}
      {...rest}
    />
  );
}
