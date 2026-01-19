# AdMob Quick Start Guide

## ✅ What's Already Done

1. ✅ Package installed: `react-native-google-mobile-ads`
2. ✅ Ad components created
3. ✅ Ad configuration file set up
4. ✅ AdMob initialized in app root
5. ✅ Plugin configured in app.json (using test App IDs)

## 🚀 Next Steps

### Step 1: Create AdMob Account & Get App IDs

1. Go to https://admob.google.com
2. Sign in with your Google account
3. Create a new AdMob account
4. Add your apps:
   - **iOS**: Bundle ID `com.createinc.70b3026932584f00a21b8830ccd84bfa`
   - **Android**: Package `com.anonymous.Natively`
5. Copy your **App IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### Step 2: Update app.json

Replace the test App IDs in `app.json` with your real App IDs:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-YOUR-ANDROID-APP-ID",
    "iosAppId": "ca-app-pub-YOUR-IOS-APP-ID"
  }
]
```

### Step 3: Create Ad Units

1. In AdMob dashboard, go to **Apps** → Select your app
2. Click **Ad units** → **Add ad unit**
3. Create ad units for:
   - Banner (for top/bottom of screen)
   - Interstitial (full-screen between actions)
   - Rewarded (optional, for premium features)
4. Copy the **Ad Unit IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### Step 4: Update Ad Unit IDs

Edit `utils/adConfig.ts` and replace the `PRODUCTION_AD_UNITS` with your real Ad Unit IDs:

```typescript
export const PRODUCTION_AD_UNITS = {
  banner: {
    ios: 'ca-app-pub-YOUR-IOS-BANNER-ID',
    android: 'ca-app-pub-YOUR-ANDROID-BANNER-ID',
  },
  interstitial: {
    ios: 'ca-app-pub-YOUR-IOS-INTERSTITIAL-ID',
    android: 'ca-app-pub-YOUR-ANDROID-INTERSTITIAL-ID',
  },
  // ... etc
};
```

### Step 5: Add Ads to Your App

#### Option A: Banner Ad (Always Visible)

```tsx
import BannerAd from '@/components/ads/BannerAd';

// In your screen component:
<BannerAd position="bottom" />
```

#### Option B: Interstitial Ad (After Actions)

```tsx
import { showInterstitialAd } from '@/utils/adConfig';

// After user completes an action:
const handleCompletePrayer = async () => {
  // Your logic here
  await showInterstitialAd();
};
```

#### Option C: Rewarded Ad (For Premium Features)

```tsx
import { showRewardedAd } from '@/utils/adConfig';

const handleUnlockFeature = async () => {
  await showRewardedAd((reward) => {
    // User earned reward, unlock feature
    console.log('Feature unlocked!');
  });
};
```

### Step 6: Rebuild Your App

Since AdMob requires native code:

```bash
# Clean and rebuild
npx expo prebuild --clean

# For iOS
npx expo run:ios

# For Android
npx expo run:android

# Or with EAS Build
eas build --platform ios
eas build --platform android
```

## 📍 Suggested Ad Placement

### Banner Ads
- Bottom of home screen
- Bottom of Iman tracker screen
- Bottom of prayer times screen

### Interstitial Ads
- After completing 5 prayers (daily milestone)
- After completing a workout
- After reading Quran
- After completing weekly goals

### Rewarded Ads (Optional)
- Unlock premium features
- Skip cooldown timers
- Get bonus Iman points
- Unlock exclusive content

## ⚠️ Important Notes

1. **Test Ads**: The app currently uses Google's test ad units. Replace with your real IDs before production.

2. **Ad Policies**: Follow AdMob policies:
   - Don't click your own ads
   - Don't encourage users to click ads
   - Don't place ads too close to interactive elements

3. **User Experience**: 
   - Don't show too many ads
   - Show ads at natural break points
   - Consider user experience over revenue

4. **Testing**: Always test with test ad units first, then switch to production IDs.

## 📚 More Examples

See `components/ads/AdExamples.tsx` for more implementation examples.

## 🆘 Troubleshooting

- **Ads not showing?** Check internet connection and Ad Unit IDs
- **Build errors?** Run `npx expo prebuild --clean`
- **iOS issues?** Verify Bundle ID matches AdMob configuration
- **Android issues?** Verify Package Name matches AdMob configuration

For detailed setup instructions, see `ADMOB_SETUP_GUIDE.md`.
