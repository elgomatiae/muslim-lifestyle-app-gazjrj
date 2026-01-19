# AdMob Native Module Error - Fix

## The Error

```
TurboModuleRegistry.getEnforcing(...): 'RNGoogleMobileAdsModule' could not be found
```

This error occurs because AdMob requires **native code** that isn't available in Expo Go.

## Solution: Rebuild with Native Code

AdMob **cannot** run in Expo Go. You must rebuild the app with native code.

### Step 1: Generate Native Code

```bash
cd project
npx expo prebuild --clean
```

This creates the `ios/` and `android/` folders with native code.

### Step 2: Run on Device/Simulator

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

### Step 3: Or Use EAS Build

```bash
eas build --platform ios
eas build --platform android
```

## What I've Fixed

I've updated the code to **gracefully handle** when the native module isn't available:

1. ✅ **adConfig.ts**: Checks if module exists before using it
2. ✅ **BannerAd.tsx**: Returns null if module isn't available (doesn't crash)
3. ✅ **All ad functions**: Return false/do nothing if module isn't available

Now the app **won't crash** in Expo Go, but ads won't work until you rebuild.

## Testing

### In Expo Go (Current)
- ❌ Ads won't work (native module not available)
- ✅ App won't crash
- ✅ You can develop other features

### After Rebuild
- ✅ Ads will work
- ✅ Your real ad unit will be used
- ✅ You can test ad integration

## Quick Test

After rebuilding, test with:

```tsx
import { showRewardedAd } from '@/utils/adConfig';

// Test the ad
await showRewardedAd((reward) => {
  console.log('Reward earned!', reward);
});
```

## Important Notes

1. **Expo Go Limitation**: AdMob requires native code, so it won't work in Expo Go
2. **Development Build Required**: You must use `expo run:ios` or `expo run:android`
3. **EAS Build**: For production, use `eas build` to create standalone apps

## Next Steps

1. Run `npx expo prebuild --clean`
2. Run `npx expo run:ios` or `npx expo run:android`
3. Test your ads!

The app is now safe to run in Expo Go (ads just won't work), but you'll need to rebuild to actually use ads.
