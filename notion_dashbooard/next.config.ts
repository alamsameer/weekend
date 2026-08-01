import type { NextConfig } from "next";

// Only for local corporate proxies — never disable TLS verification on Vercel.
if (
  process.env.VERCEL !== "1" &&
  process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {};

export default nextConfig;
