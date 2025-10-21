import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'my-v0-project',
  webDir: 'public', // Can be 'public' for static assets, but API must be live
  server: {
    url: 'http://192.168.29.19:3000', // during dev, point to local Next.js server
    cleartext: true
  },
};

export default config;
