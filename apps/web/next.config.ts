import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Containers build into their own directory so the Compose volume never
  // becomes a mount point inside the host .next directory.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Emits a self-contained server bundle so the production image stays small.
  output: "standalone",
  reactStrictMode: true,
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default withNextIntl(nextConfig);
