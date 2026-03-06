/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/branch-manager-dashboard", destination: "/dashboard", permanent: true },
      { source: "/branch-manager-dashboard/:path*", destination: "/dashboard/:path*", permanent: true },
      // Static HTML → Next.js website routes
      { source: "/landing.html", destination: "/", permanent: true },
      { source: "/courses-details.html", destination: "/courses", permanent: true },
      { source: "/store.html", destination: "/store", permanent: true },
    ]
  },
}

export default nextConfig
