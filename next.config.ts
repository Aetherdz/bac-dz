import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // The old countdown lived as a generic tool with an invented default date.
    // It is now a dedicated, honest page; keep the old URLs working.
    return [
      { source: "/:locale(ar|fr|en)/adawat/bac-countdown", destination: "/:locale/adad-tanazuli-bac", permanent: true },
      { source: "/:locale(ar|fr|en)/outils/bac-countdown", destination: "/:locale/compte-a-rebours-bac", permanent: true },
      { source: "/:locale(ar|fr|en)/tools/bac-countdown", destination: "/:locale/bac-countdown", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
