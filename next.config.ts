import type { NextConfig } from "next";

/**
 * Ada package-lock di folder induk (@Project Sistem Informasi); tanpa ini Next
 * bisa salah mendeteksi workspace root dan merusak file tracing di build/deploy.
 */
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd()
};

export default nextConfig;
