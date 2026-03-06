/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cabosecobres.myshopify.com',
        pathname: '/cdn/**',
      },
    ],
  },
};

module.exports = nextConfig;
