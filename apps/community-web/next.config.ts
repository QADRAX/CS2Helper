import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@cs2helper/auth", "swagger-ui-react"],
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
