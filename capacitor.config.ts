import type { CapacitorConfig } from '@capacitor/cli';

// Set CAPACITOR_SERVER_URL before running cap sync to control where the iOS app loads from:
//   Simulator (default):  CAPACITOR_SERVER_URL=http://127.0.0.1:5173 npm run ios:sync
//   iPhone on WiFi:       CAPACITOR_SERVER_URL=http://192.168.1.8:5173 npm run ios:sync
// Local browser dev is always http://localhost:5173 via `npm run dev` — unaffected by this.
const serverUrl = process.env.CAPACITOR_SERVER_URL ?? 'http://127.0.0.1:5173';

const config: CapacitorConfig = {
  appId: 'com.uipath.maestro',
  appName: 'Maestro Mobile',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: true,
    allowNavigation: [
      '*.uipath.com',
      '*.api.uipath.com',
    ],
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc',
  },
};

export default config;
