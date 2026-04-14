import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    // PDFKit standard fonts (.afm) must be traced for runtime in standalone/server builds.
    "/api/**": ["./node_modules/pdfkit/js/data/*.afm"],
  },
};

export default nextConfig;
