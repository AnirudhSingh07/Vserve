import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'my-v0-project',
  webDir: '.next', // Can be 'public' for static assets, but API must be live
  server: {
    url: 'http://10.215.7.151:3000', // during dev, point to local Next.js server
    cleartext: true
  },
};

export default config;
