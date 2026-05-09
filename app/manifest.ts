import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pixeloid AI',
    short_name: 'Pixeloid',
    description: 'Your AI-Powered Daily Life Assistant by Shaurya Sharma',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0c29',
    theme_color: '#667eea',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}