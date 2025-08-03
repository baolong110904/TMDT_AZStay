import { hostname } from "os";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos", // cho phép lấy ảnh từ nơi host
      },
      {
        protocol: "https",
        hostname: "picsum.photos" // test
      }
    ],
  },
};

export default nextConfig;