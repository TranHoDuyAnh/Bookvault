import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeBase — Trung Tâm Cuộc Sống',
    short_name: 'HomeBase',
    description: 'Trung tâm quản lý cuộc sống cá nhân: bản tin TP.HCM, tủ sách, giải trí và ngày quan trọng.',
    start_url: '/app/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafafa',
    theme_color: '#171717',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
