/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hanime.tv',
      },
      {
        protocol: 'https',
        hostname: 'static-cdn.hanime.tv',
      },
      {
        protocol: 'http',
        hostname: 'hentaihaven.xxx',
      },
      {
          protocol: 'https',
          hostname: 'hentaihaven.xxx',
      }
    ],
  },
};

module.exports = nextConfig;
