import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Build a Content-Security-Policy header value that:
//  • Allows Next.js dev HMR (unsafe-eval in dev only)
//  • Allows the inline analytics scripts we inject (GTM, GA4, Meta Pixel, custom scripts)
//  • Allows Google Fonts, Maps iframes, and our own CDN
function buildCsp(): string {
  return [
    "default-src 'self'",
    // 'unsafe-inline' is required for our analytics <script dangerouslySetInnerHTML> blocks.
    // 'unsafe-eval' is only added in dev (Next.js HMR needs it).
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    // 'self' for the studio preview iframe; Google Maps/YouTube for embedded blocks
    "frame-src 'self' https://maps.google.com https://www.google.com https://maps.googleapis.com https://www.youtube.com",
    // Analytics beacons + Next.js hot-reload WS in dev
    `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.analytics.google.com${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
  ].join("; ");
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // The /preview route is force-dynamic (SSR) and reads content/* via fs at runtime.
  // Tell Vercel's file tracer to bundle the content directory with those serverless functions.
  outputFileTracingIncludes: {
    "/site/(.*)": ["./content/**/*", "./public/content/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
