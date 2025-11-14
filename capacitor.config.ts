import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Vserve',
  webDir: 'public', // Can be 'public' for static assets, but API must be live
  server: {
    url: 'https://vserve.vercel.app/', // during dev, point to local Next.js server
    cleartext: true
  },
};

export default config;
