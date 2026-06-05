import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "/api";
const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: `${apiPrefix}/:path*`,
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dgxaoro2n/**", // Replace with your cloud name if needed, or use '/**'
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**", // Allows all paths for Unsplash
      },
    ],
  },
};

export default withNextIntl(nextConfig);
