/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['api.dicebear.com'],
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  },

  async rewrites() {
    // استخدم rewrite المحلي فقط أثناء التطوير
    if (!isProd) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
