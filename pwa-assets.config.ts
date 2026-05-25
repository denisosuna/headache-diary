import { defineConfig, Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    transparent: { sizes: [64, 192, 512], favicons: [[48, 'favicon.ico']] },
    maskable: { sizes: [512], padding: 0.3, resizeOptions: { background: '#0f172a' } },
    apple: { sizes: [180], padding: 0.1, resizeOptions: { background: '#0f172a' } },
  } as Preset,
  images: ['public/icon.svg'],
});
