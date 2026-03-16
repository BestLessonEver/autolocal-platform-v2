/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/services/web-development',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services/web-development/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services/appointment-booking',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
