import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The /preview route is force-dynamic (SSR) and reads content/* via fs at runtime.
  // Tell Vercel's file tracer to bundle the content directory with those serverless functions.
  outputFileTracingIncludes: {
    "/site/(.*)": ["./content/**/*", "./public/content/**/*"],
  },
};

export default nextConfig;
