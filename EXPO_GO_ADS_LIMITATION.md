# Why Ads Don't Work in Expo Go

## The Issue

**Expo Go cannot run native modules** like `react-native-google-mobile-ads`. This is a fundamental limitation of Expo Go - it only includes a pre-built set of native modules.

## The Solution: Development Build

To test ads, you need to create a **development build** (also called a "custom development client"). This is a custom version of your app that includes your native dependencies.

## Quick Start: Create Development Build for iOS

### Option 1: Build Locally (Faster for Testing)

1. **Generate native code** (if you haven't already):
   ```bash
   cd project
   npx expo prebuild --clean
   ```

2. **Run on iOS device/simulator**:
   ```bash
   npx expo run:ios
   ```
   
   This will:
   - Build the app with native code
   - Install it on your connected iOS device or simulator
   - Start the Metro bundler

### Option 2: Build with EAS (For Physical Device)

1. **Build development client**:
   ```bash
   cd project
   eas build --profile development --platform ios
   ```

2. **Install on your device**:
   - EAS will provide a download link
   - Install via TestFlight or direct download
   - Open the app and scan the QR code from `expo start`

## What's the Difference?

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Native modules | ❌ Limited set only | ✅ All your dependencies |
| AdMob | ❌ Won't work | ✅ Works perfectly |
| Build time | ⚡ Instant (pre-built) | 🐌 5-15 minutes |
| Customization | ❌ None | ✅ Full control |

## After Building

Once you have a development build installed:

1. **Start the dev server**:
   ```bash
   npx expo start
   ```

2. **Open your development build** (not Expo Go)

3. **Scan the QR code** or press `i` for iOS simulator

4. **Ads will now work!** 🎉

## Testing Ads

After installing the development build, test your ads:

```typescript
import { showRewardedAd } from '@/utils/adConfig';

// This will now work!
await showRewardedAd((reward) => {
  console.log('Reward earned!', reward);
});
```

## Important Notes

- **Expo Go**: Use for quick prototyping (no native modules)
- **Development Build**: Use when you need native modules (like AdMob)
- **Production Build**: Use for App Store/TestFlight

## Troubleshooting

If ads still don't work after building:

1. **Clear Metro cache**:
   ```bash
   npx expo start --clear
   ```

2. **Verify AdMob is configured** in `app.json`:
   ```json
   {
     "plugins": [
       [
         "react-native-google-mobile-ads",
         {
           "androidAppId": "ca-app-pub-...",
           "iosAppId": "ca-app-pub-..."
         }
       ]
     ]
   }
   ```

3. **Check console logs** for AdMob initialization messages

## Next Steps

1. Build a development build (choose Option 1 or 2 above)
2. Install it on your device
3. Test your ads!

Your app is already configured correctly - you just need to use a development build instead of Expo Go to test ads.
