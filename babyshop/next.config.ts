// babyshop/next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",                    
  images: {
    unoptimized: true,                 
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    ],
  },
}

export default nextConfig
