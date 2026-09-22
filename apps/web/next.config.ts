import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle so the production image stays small.
  output: "standalone",
  reactStrictMode: true,
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
