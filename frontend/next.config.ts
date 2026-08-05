import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle so the production Docker image
  // only needs to copy .next/standalone instead of the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
