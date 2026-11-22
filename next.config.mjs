/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '11mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'http', hostname: '100.125.85.18', port: '9000', pathname: '/projetointegrador/**' },
    ],
  },
  allowedDevOrigins: ['192.168.0.42'],
}

export default nextConfig
