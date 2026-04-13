import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://hanimyx.vercel.app',
      lastModified: new Date(),
    },
    {
      url: 'https://hanimyx.vercel.app/popular',
      lastModified: new Date(),
    },
    {
      url: 'https://hanimyx.vercel.app/tags',
      lastModified: new Date(),
    },
  ];
}