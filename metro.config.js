const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
    new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
  ];

// Resolve AdMob module to a stub in Expo Go to prevent crashes
// This uses alias to redirect imports to our stub
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // In Expo Go, redirect AdMob imports to our stub
    // This only works at runtime, but helps prevent static analysis issues
    'react-native-google-mobile-ads': path.resolve(__dirname, 'utils', 'adMobStub.ts'),
  },
};

module.exports = config;
