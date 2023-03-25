/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/stocks/:ticker',
        destination: '/api/stocks/:ticker',
      },
    ]
  },
}

module.exports = nextConfig
