import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/tools-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joedytools.com';

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/contact-support',
    '/faq',
    '/help',
    '/how-to-use',
    '/privacy-policy',
    '/terms-of-service',
    '/support',
    '/tools',
  ];

  const routes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const toolRoutes = Object.keys(TOOLS).map((toolId) => ({
    url: `${baseUrl}/tools/${toolId}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...toolRoutes];
}
