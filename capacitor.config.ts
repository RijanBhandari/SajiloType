import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scripttodoc.app',
  appName: 'sajiloType',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#000000'
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['storage']
    }
  }
};

export default config;
