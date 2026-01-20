const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
    new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
  ];

// Stub module directory for Expo Go - prevents TurboModuleRegistry errors
// Use path.join instead of path.resolve for better cross-platform compatibility
const stubModuleDir = path.join(__dirname, 'utils', 'adMobStubModule');

// Ensure stub module directory exists (only in development, not during EAS build)
try {
  if (!fs.existsSync(stubModuleDir)) {
    fs.mkdirSync(stubModuleDir, { recursive: true });
  }

  // Ensure stub index exists
  const stubIndexPath = path.join(stubModuleDir, 'index.js');
  const stubIndexContent = `/**
 * Stub module index for react-native-google-mobile-ads
 * Prevents TurboModuleRegistry errors in Expo Go
 */

export * from '../adMobStub.js';
export { default } from '../adMobStub.js';
`;
  if (!fs.existsSync(stubIndexPath) || fs.readFileSync(stubIndexPath, 'utf8') !== stubIndexContent) {
    fs.writeFileSync(stubIndexPath, stubIndexContent);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Metro] Created/updated stub module at:', stubIndexPath);
    }
  }
} catch (error) {
  // Silently fail during EAS build - stub will be created if needed
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Metro] Could not create stub module:', error.message);
  }
}

// ALWAYS redirect to stub AND block real module source files
// This prevents Metro from analyzing the real module's TypeScript files
// which try to access TurboModuleRegistry at import time
// In native builds, the native module is registered, so imports will work via native bridge
// In Expo Go, stub prevents crash

// Block the real module's source files from being analyzed by Metro
// This prevents Metro from trying to load TypeScript files that reference native modules
const existingBlockList = config.resolver?.blockList || [];
if (!existingBlockList.some(block => block.toString().includes('react-native-google-mobile-ads'))) {
  config.resolver = config.resolver || {};
  config.resolver.blockList = [
    ...existingBlockList,
    // Block ALL source files from the AdMob module
    // This prevents Metro from analyzing TypeScript files that access TurboModuleRegistry
    // Pattern must match both forward and backslashes for cross-platform compatibility
    // Block the entire src directory
    /node_modules[\/\\]react-native-google-mobile-ads[\/\\]src/,
    // Block specific files that cause the TurboModuleRegistry error
    /node_modules[\/\\]react-native-google-mobile-ads[\/\\]src[\/\\]MobileAds\.ts$/,
    /node_modules[\/\\]react-native-google-mobile-ads[\/\\]src[\/\\]index\.ts$/,
    /node_modules[\/\\]react-native-google-mobile-ads[\/\\]src[\/\\]specs[\/\\]modules[\/\\]NativeGoogleMobileAdsModule\.ts$/,
  ];
}

// Only redirect to stub in Expo Go (when native directories don't exist)
// In native builds, use the real module
// Use try-catch to handle cases where file system access might fail during EAS build
let isNativeBuild = false;
try {
  isNativeBuild = fs.existsSync(path.join(__dirname, 'android')) || fs.existsSync(path.join(__dirname, 'ios'));
} catch (error) {
  // During EAS build, assume it's a native build
  isNativeBuild = true;
}

if (!isNativeBuild) {
  // Expo Go - redirect to stub to prevent Metro from analyzing real module
  try {
    config.resolver = config.resolver || {};
    config.resolver.extraNodeModules = {
      ...config.resolver?.extraNodeModules,
      // Redirect ALL imports of react-native-google-mobile-ads to our stub
      // This prevents Metro from even looking at the real module directory
      'react-native-google-mobile-ads': stubModuleDir,
    };
  } catch (error) {
    // Silently fail if we can't set up the redirect
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Metro] Could not set up stub redirect:', error.message);
    }
  }
}

module.exports = config;
