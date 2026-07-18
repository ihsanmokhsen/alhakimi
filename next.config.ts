import type { NextConfig } from "next";

/**
 * Ada package-lock di folder induk (@Project Sistem Informasi); tanpa ini Next
 * bisa salah mendeteksi workspace root dan merusak file tracing di build/deploy.
 */
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    localPatterns: [
      { pathname: "/api/project-logo/**" },
      { pathname: "/api/journal-photo/**" },
      { pathname: "/api/essay-cover/**" },
      { pathname: "/api/essay-image/**" },
      { pathname: "/api/hero-image" },
      { pathname: "/foto.png" },
      { pathname: "/hero.jpg" }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
