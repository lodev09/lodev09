import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Allow testing the dev server from other devices on the local network
  allowedDevOrigins: ["macbook.local", "*.local"],
  serverExternalPackages: ["@react-pdf/renderer"],
}

export default nextConfig
