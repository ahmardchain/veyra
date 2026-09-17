import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? { typescript: { tsconfigPath: "tsconfig.vercel.json" } } : {}),
};

export default nextConfig;
