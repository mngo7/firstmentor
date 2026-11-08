/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Membership tiers were removed; keep old sign-up links working
      { source: '/signup/choose-membership', destination: '/signup', permanent: true },
    ]
  },
}

module.exports = nextConfig
