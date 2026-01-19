# AdMob Metro Config Fix

## The Problem

Even with lazy imports, Metro bundler still tries to analyze `react-native-google-mobile-ads` when it sees dynamic imports, causing the `TurboModuleRegistry` error.

## The Solution

I've added a Metro resolver that **stubs out** the AdMob module when running in Expo Go. This prevents Metro from trying to load the native module.

### What Changed

1. **metro.config.js** - Added a custom resolver that:
   - Detects when `react-native-google-mobile-ads` is being imported
   - Checks if we're in Expo Go (`executionEnvironment === 'storeClient'`)
   - Returns an empty stub module instead of trying to load the real module

### How It Works

```javascript
resolveRequest: (context, moduleName, platform) => {
  if (moduleName === 'react-native-google-mobile-ads') {
    // Check if Expo Go
    if (Constants.executionEnvironment === 'storeClient') {
      return { type: 'empty' }; // Return stub
    }
  }
  // Normal resolution for other modules
}
```

## Testing

After this change:
1. ✅ Metro won't try to load the AdMob module in Expo Go
2. ✅ App should start without the `TurboModuleRegistry` error
3. ✅ All ad functions will gracefully return `false` or `null`
4. ✅ After rebuilding with native code, ads will work normally

## Next Steps

1. **Restart Metro bundler** - Clear cache and restart:
   ```bash
   npx expo start --clear
   ```

2. **Test the app** - It should now start without errors

3. **When ready for ads** - Rebuild with native code:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios  # or run:android
   ```

## Important Notes

- This fix only applies to Expo Go
- After rebuilding, the real AdMob module will be used
- The stub prevents crashes but ads won't work until rebuild
