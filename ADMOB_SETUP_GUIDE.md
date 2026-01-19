# Google AdMob Setup Guide

Complete guide to integrate Google AdMob ads into your Expo app.

## Prerequisites

1. **Google AdMob Account**
   - Go to https://admob.google.com
   - Sign in with your Google account
   - Create a new AdMob account (if you don't have one)
   - Add your app to AdMob

2. **App Information Needed**
   - iOS Bundle ID: `com.createinc.70b3026932584f00a21b8830ccd84bfa`
   - Android Package Name: `com.anonymous.Natively`

## Step 1: Install Required Packages

```bash
cd project
npx expo install react-native-google-mobile-ads
```

## Step 2: Configure app.json

Add the AdMob plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      // ... existing plugins ...
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

**Note:** Replace the App IDs with your actual AdMob App IDs from your AdMob dashboard.

## Step 3: Get Your Ad Unit IDs

1. In AdMob dashboard, go to **Apps** → Select your app
2. Click **Ad units** → **Add ad unit**
3. Choose ad format:
   - **Banner**: Rectangular ads at top/bottom of screen
   - **Interstitial**: Full-screen ads between content
   - **Rewarded**: Full-screen ads users can watch for rewards
   - **Native**: Customizable ads that match your app design
4. Copy the Ad Unit IDs (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

## Step 4: Create Ad Components

See the created files:
- `components/ads/BannerAd.tsx` - Banner ad component
- `components/ads/InterstitialAd.tsx` - Full-screen ad component
- `components/ads/RewardedAd.tsx` - Rewarded ad component
- `utils/adConfig.ts` - Ad configuration file

## Step 5: Initialize AdMob

The AdMob SDK will be initialized automatically when you use the components.

## Step 6: Add Ads to Your App

### Example: Add Banner Ad to Home Screen

```tsx
import BannerAd from '@/components/ads/BannerAd';

// In your component:
<BannerAd unitId="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" />
```

### Example: Show Interstitial Ad

```tsx
import { showInterstitialAd } from '@/utils/adConfig';

// After user action (e.g., completing a prayer):
await showInterstitialAd();
```

## Step 7: Rebuild Your App

Since AdMob requires native code, you need to rebuild:

```bash
# For iOS
npx expo prebuild --clean
npx expo run:ios

# For Android
npx expo prebuild --clean
npx expo run:android

# Or with EAS Build
eas build --platform ios
eas build --platform android
```

## Step 8: Test Ads

### Test Ad Unit IDs (Use these during development)

- **Banner (iOS)**: `ca-app-pub-3940256099942544/2934735716`
- **Banner (Android)**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial (iOS)**: `ca-app-pub-3940256099942544/4411468910`
- **Interstitial (Android)**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded (iOS)**: `ca-app-pub-3940256099942544/1712485313`
- **Rewarded (Android)**: `ca-app-pub-3940256099942544/5224354917`

**Important:** Replace with your real Ad Unit IDs before production!

## Best Practices

1. **Don't Show Too Many Ads**
   - Show interstitial ads after meaningful actions (completing prayers, workouts, etc.)
   - Limit to 1-2 ads per user session

2. **User Experience**
   - Don't interrupt critical flows
   - Show ads at natural break points
   - Consider rewarded ads for premium features

3. **Testing**
   - Always test with test ad units first
   - Test on real devices, not just simulators
   - Verify ads load correctly before production

4. **Compliance**
   - Follow AdMob policies
   - Don't click your own ads
   - Don't encourage users to click ads

## Troubleshooting

### Ads Not Showing
- Check internet connection
- Verify Ad Unit IDs are correct
- Ensure app is not in test mode with wrong test device ID
- Check AdMob dashboard for ad serving status

### Build Errors
- Run `npx expo prebuild --clean` to regenerate native code
- Ensure all dependencies are installed
- Check that app.json configuration is correct

### iOS Specific
- Ensure your iOS app is registered in AdMob
- Check that Bundle ID matches AdMob configuration
- Verify App ID is correct in app.json

### Android Specific
- Ensure your Android app is registered in AdMob
- Check that Package Name matches AdMob configuration
- Verify App ID is correct in app.json

## Next Steps

1. Create your AdMob account and add your apps
2. Get your App IDs and Ad Unit IDs
3. Update `utils/adConfig.ts` with your Ad Unit IDs
4. Add ads to strategic locations in your app
5. Test thoroughly before production
6. Monitor performance in AdMob dashboard

## Resources

- [AdMob Documentation](https://developers.google.com/admob)
- [React Native Google Mobile Ads](https://github.com/invertase/react-native-google-mobile-ads)
- [AdMob Policies](https://support.google.com/admob/answer/6128543)
