import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Pixeloid AI - Daily Life Assistant',
    short_name: 'Pixeloid',
    description: 'AI-powered daily life assistant with chat, image generation, and smart tools. Created by Shaurya Sharma.',
    start_url: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'window-controls-overlay'],
    background_color: '#0f0c29',
    theme_color: '#667eea',
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    scope: '/',
    categories: ['productivity', 'utilities', 'ai', 'lifestyle', 'social'],
    launch_handler: {
      client_mode: 'focus-existing',
    },
    related_applications: [],
    prefer_related_applications: false,
    scope_extensions: [
      { origin: 'https://pixeloidpro.live' },
    ],
    shortcuts: [
      {
        name: 'AI Chat',
        short_name: 'Chat',
        url: '/chat',
        description: 'Start chatting with Pixeloid AI',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
        description: 'View your stats and credits',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
      {
        name: 'Generate Image',
        short_name: 'Image',
        url: '/chat',
        description: 'Generate AI images',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
    ],
    share_target: {
      action: '/chat',
      method: 'GET',
      params: {
        text: 'text',
        title: 'title',
        url: 'url',
      },
    },
    protocol_handlers: [
      {
        protocol: 'web+pixeloid',
        url: '/chat?q=%s',
      },
    ],
    icons: [
      { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Home Screen',
      },
      {
        src: '/screenshots/chat.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'AI Chat',
      },
    ],
  };
}