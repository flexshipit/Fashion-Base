/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    // Coolify's builder OOM-kills the default Turbopack production build
    // (exit 137). These options only affect `next build --webpack`.
    webpackMemoryOptimizations: true,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
