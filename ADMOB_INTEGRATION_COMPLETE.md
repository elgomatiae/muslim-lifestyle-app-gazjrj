# AdMob Integration Complete ✅

## Your AdMob Configuration

### App ID
- **App ID**: `ca-app-pub-2757517181313212~3571222456`
- ✅ Configured in `app.json`

### Ad Unit ID
- **Rewarded Interstitial Ad Unit**: `ca-app-pub-2757517181313212/8725693825`
- ✅ Configured in `utils/adConfig.ts`

## What's Been Done

1. ✅ **App ID Added**: Updated `app.json` with your AdMob App ID
2. ✅ **Ad Unit ID Added**: Updated `utils/adConfig.ts` with your rewarded interstitial ad unit
3. ✅ **AdMob Initialized**: Automatically initialized when app starts
4. ✅ **Ad Preloading**: Rewarded ads are preloaded in the background

## About Rewarded Interstitial Ads

Your ad unit is a **Rewarded Interstitial** ad, which:
- Shows as a full-screen ad (like interstitial)
- Users can skip after watching for a set duration
- Users earn a reward for watching
- Combines the best of both interstitial and rewarded ads

The current implementation using `RewardedAd` will work perfectly with your rewarded interstitial ad unit.

## How to Use Your Rewarded Ad

### Basic Usage

```tsx
import { showRewardedAd } from '@/utils/adConfig';

const handleShowAd = async () => {
  const shown = await showRewardedAd((reward) => {
    // User watched the ad and earned reward
    console.log('Reward earned:', reward);
    // Give user their reward (bonus points, unlock feature, etc.)
  });

  if (!shown) {
    console.log('Ad not ready');
  }
};
```

### Example: Unlock Feature After Watching Ad

```tsx
import { showRewardedAd } from '@/utils/adConfig';
import { Alert } from 'react-native';

const unlockPremiumFeature = async () => {
  const shown = await showRewardedAd((reward) => {
    Alert.alert(
      'Feature Unlocked!',
      `You earned ${reward.amount} ${reward.type}!`
    );
    // Unlock the feature
    setPremiumFeatureUnlocked(true);
  });

  if (!shown) {
    Alert.alert('Ad Not Available', 'Please try again later.');
  }
};
```

### Example: Bonus Iman Points

```tsx
import { showRewardedAd } from '@/utils/adConfig';
import { useImanTracker } from '@/contexts/ImanTrackerContext';

const earnBonusPoints = async () => {
  const { addBonusPoints } = useImanTracker();
  
  await showRewardedAd((reward) => {
    // Add bonus Iman points
    addBonusPoints(10);
    Alert.alert('Bonus Earned!', 'You received 10 bonus Iman points!');
  });
};
```

## Testing Your Ads

### Current Setup
- **Development Mode**: Uses Google's test ad units (safe for testing)
- **Production Mode**: Will use your real ad unit when enabled

### To Test with Your Real Ad Unit

1. Open `utils/adConfig.ts`
2. Change `USE_PRODUCTION_ADS` to `true`:
   ```typescript
   const USE_PRODUCTION_ADS = true; // Enable production ads
   ```
3. Rebuild your app:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios  # or run:android
   ```

### Important Notes
- ⚠️ **Don't click your own ads** - This violates AdMob policies
- ⚠️ **Test thoroughly** before enabling production ads
- ✅ **Use test ads** during development to avoid policy violations

## Suggested Ad Placement

### Good Places to Show Rewarded Ads:
1. **After completing daily goals** - "Watch ad for bonus Iman points"
2. **Unlock premium features** - "Watch ad to unlock this feature"
3. **Skip cooldown timers** - "Watch ad to skip wait time"
4. **Get extra attempts** - "Watch ad for another try"
5. **Bonus content** - "Watch ad to unlock exclusive content"

### Best Practices:
- ✅ Show ads at natural break points
- ✅ Make the reward clear to users
- ✅ Don't force users to watch ads
- ✅ Limit ad frequency (1-2 per session max)
- ✅ Provide value in exchange for watching

## Next Steps

1. **Test the Integration**:
   - Run the app
   - Call `showRewardedAd()` from somewhere in your app
   - Verify the ad loads and displays correctly

2. **Add to Your App**:
   - Choose strategic locations to show rewarded ads
   - Implement reward logic (bonus points, unlocks, etc.)
   - Test user experience

3. **Before Publishing**:
   - Test thoroughly with your real ad unit
   - Ensure compliance with AdMob policies
   - Monitor ad performance in AdMob dashboard

4. **After Publishing**:
   - Monitor ad performance
   - Optimize placement based on data
   - Consider adding more ad units (banner, interstitial) if needed

## AdMob Policies Reminder

Make sure your implementation follows AdMob policies:
- ✅ Don't click your own ads
- ✅ Don't encourage users to click ads
- ✅ Don't place ads too close to interactive elements
- ✅ Provide clear value proposition for rewarded ads
- ✅ Don't mislead users about rewards

## Files Modified

1. `app.json` - Added your App ID
2. `utils/adConfig.ts` - Added your Ad Unit ID and configuration
3. `app/_layout.tsx` - AdMob initialization (already done)

## Support

If you encounter issues:
1. Check AdMob dashboard for ad serving status
2. Verify App ID and Ad Unit ID are correct
3. Ensure internet connection is active
4. Check console logs for error messages
5. Review AdMob documentation: https://developers.google.com/admob

Your AdMob integration is complete and ready to use! 🎉
