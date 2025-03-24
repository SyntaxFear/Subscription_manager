import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SubSavvy',
  slug: 'Subs',
  version: '1.0.0',
  scheme: 'SubSavvy',
  orientation: 'portrait',
  icon: './assets/Light.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
    dark: {
      backgroundColor: '#000000',
    },
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    icon: {
      dark: './assets/Light.png',
      light: './assets/Light.png',
      tinted: './assets/Light.png',
    },
    supportsTablet: true,
    bundleIdentifier: 'com.parastashvili.Subs',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.parastashvili.Subs',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-dev-launcher',
      {
        launchMode: 'most-recent',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash.png',
        dark: {
          image: './assets/splash.png',
          backgroundColor: '#000000',
        },
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'bf4a4894-aa39-447c-96a9-a84d43658bdb',
    },
  },
});
