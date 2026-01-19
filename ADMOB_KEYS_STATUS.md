# AdMob Keys Status

## ✅ Currently Configured

### App IDs (in app.json)
- **iOS App ID**: `ca-app-pub-2757517181313212~3571222456`
- **Android App ID**: `ca-app-pub-2757517181313212~3571222456`
- ⚠️ **Note**: Currently using the same App ID for both platforms. If you have separate iOS and Android App IDs, please provide them.

### Ad Unit IDs (in utils/adConfig.ts)
- **Rewarded Interstitial**: `ca-app-pub-2757517181313212/8725693825` ✅ (configured for both iOS and Android)

## ❓ Missing (Optional but Recommended)

### Banner Ad Unit IDs
- **iOS Banner**: Not configured (using test ID)
- **Android Banner**: Not configured (using test ID)
- **Status**: If you want banner ads, please provide these IDs

### Interstitial Ad Unit IDs  
- **iOS Interstitial**: Not configured (using test ID)
- **Android Interstitial**: Not configured (using test ID)
- **Status**: If you want interstitial ads, please provide these IDs

## 📝 What You Need to Provide (if available)

If you have created additional ad units in AdMob, please provide:

1. **Separate iOS App ID** (if different from Android)
2. **Separate Android App ID** (if different from iOS)
3. **Banner Ad Unit IDs** (iOS and Android)
4. **Interstitial Ad Unit IDs** (iOS and Android)

## Current Status

✅ **Rewarded Interstitial**: Fully configured and ready
⚠️ **Banner & Interstitial**: Using test IDs (will work but won't generate revenue)

The app is configured to work with your rewarded interstitial ad unit. Banner and interstitial ads will use Google's test ad units until you provide your real ad unit IDs.
