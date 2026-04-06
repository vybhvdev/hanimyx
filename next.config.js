/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.hanime.tv',
      },
      {
        protocol: 'https',
        hostname: '**.hentaihaven.xxx',
      },
      {
        protocol: 'http',
        hostname: '**.hentaihaven.xxx',
      },
    ],
  },
};

module.exports = nextConfig;
