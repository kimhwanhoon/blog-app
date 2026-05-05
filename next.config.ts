import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/@:username", destination: "/u/:username" },
      { source: "/@:username/:path*", destination: "/u/:username/:path*" },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
