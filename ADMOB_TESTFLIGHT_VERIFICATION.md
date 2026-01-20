# AdMob TestFlight Verification Checklist

## ✅ Pre-Flight Configuration Check

### 1. App IDs (in app.json) ✅
- **iOS App ID**: `ca-app-pub-2757517181313212~3571222456`
- **Android App ID**: `ca-app-pub-2757517181313212~3571222456`
- **Status**: ✅ Configured correctly

### 2. Ad Unit IDs (in utils/adConfig.ts)

#### Rewarded Interstitial ✅
- **iOS**: `ca-app-pub-2757517181313212/8725693825`
- **Android**: `ca-app-pub-2757517181313212/8725693825`
- **Status**: ✅ Using your production ad unit

#### Banner Ads ⚠️
- **iOS**: `ca-app-pub-3940256099942544/2934735716` (TEST ID)
- **Android**: `ca-app-pub-3940256099942544/6300978111` (TEST ID)
- **Status**: ⚠️ Using Google test IDs (won't generate revenue)
- **Action**: If you want banner ads, create banner ad units in AdMob and update

#### Interstitial Ads ⚠️
- **iOS**: `ca-app-pub-3940256099942544/4411468910` (TEST ID)
- **Android**: `ca-app-pub-3940256099942544/1033173712` (TEST ID)
- **Status**: ⚠️ Using Google test IDs (won't generate revenue)
- **Action**: If you want interstitial ads, create interstitial ad units in AdMob and update

### 3. Production Mode ✅
- **USE_PRODUCTION_ADS**: `true` ✅
- **Status**: Will use production ad units (not test IDs)

## 🧪 TestFlight Testing Checklist

### Step 1: Install TestFlight Build
- [ ] Install the app from TestFlight on your iOS device
- [ ] Open the app and let it fully load

### Step 2: Check Console Logs
Look for these AdMob initialization messages in Xcode console or device logs:

- [ ] `[AdMob] Initialized successfully` - Should appear on app startup
- [ ] `[AdMob] Rewarded interstitial ad loaded` - Should appear when rewarded ad is requested

**If you see errors:**
- `[AdMob] Module not available` - Native module not loaded (shouldn't happen in TestFlight)
- `[AdMob] Stub module detected` - Wrong module loaded (shouldn't happen in TestFlight)

### Step 3: Test Rewarded Ads (Access Gates)
Test the rewarded interstitial ad that unlocks features:

1. **Navigate to a gated feature** (e.g., Lectures, Recitations, Wellness sections)
2. **Tap to access** - Should trigger access gate
3. **Watch for ad**:
   - [ ] Ad should load and display
   - [ ] Ad should be a rewarded interstitial (full-screen with reward)
   - [ ] After watching, feature should unlock
   - [ ] Success message should appear

**Expected Behavior:**
- Ad loads within 2-5 seconds
- Ad displays full-screen
- After completion, feature unlocks
- Console shows: `[AdMob] Reward earned`

**If ad doesn't show:**
- Check internet connection
- Wait a few seconds (ads may take time to load)
- Check console for error messages
- Verify ad unit ID is correct in AdMob dashboard

### Step 4: Verify Ad Unit IDs in AdMob Dashboard

1. **Go to AdMob Dashboard**: https://admob.google.com
2. **Navigate to**: Apps → Your App → Ad units
3. **Verify**:
   - [ ] Rewarded Interstitial ad unit exists: `ca-app-pub-2757517181313212/8725693825`
   - [ ] Ad unit status is "Ready" or "Active"
   - [ ] Ad unit is linked to your iOS app

### Step 5: Check Ad Requests in AdMob

1. **Go to AdMob Dashboard**: https://admob.google.com
2. **Navigate to**: Reports → Overview
3. **After testing ads in TestFlight**:
   - [ ] Check if ad requests appear in reports
   - [ ] Verify requests are coming from your iOS app
   - [ ] Check for any error messages

**Note**: It may take a few minutes for requests to appear in the dashboard.

## 🔍 Verification Points

### ✅ What Should Work
- [x] AdMob SDK initializes on app startup
- [x] Rewarded interstitial ads load and display
- [x] Ads use your production ad unit ID: `ca-app-pub-2757517181313212/8725693825`
- [x] Ads unlock features after completion
- [x] No crashes or errors related to ads

### ⚠️ What to Watch For
- [ ] Ad loading time (should be 2-5 seconds)
- [ ] Ad display quality (should be full-screen, clear)
- [ ] Reward callback fires correctly
- [ ] Feature unlocks after ad completion
- [ ] No "Ad not available" errors

### ❌ Red Flags (Should NOT Happen)
- ❌ App crashes when trying to show ads
- ❌ "Feature Unavailable" message (means ad didn't load)
- ❌ Test ad IDs showing instead of your ad unit
- ❌ Console errors about native module not found

## 📝 Quick Verification Commands

If you have access to device logs, look for:

```bash
# Good signs:
[AdMob] Initialized successfully
[AdMob] Rewarded interstitial ad loaded
[AdMob] Reward earned: { type: 'rewarded_interstitial', amount: 1 }

# Bad signs:
[AdMob] Module not available
[AdMob] Stub module detected
[AdMob] Error loading rewarded ad
```

## 🎯 Current Configuration Summary

### ✅ Configured & Ready
- **App IDs**: Both iOS and Android configured
- **Rewarded Interstitial**: Production ad unit configured
- **Production Mode**: Enabled

### ⚠️ Using Test IDs (Optional)
- **Banner Ads**: Using Google test IDs (create real ones if needed)
- **Interstitial Ads**: Using Google test IDs (create real ones if needed)

## 🚀 Next Steps After Verification

1. **If ads work correctly**:
   - ✅ You're ready to submit to App Store
   - ✅ Ads will work the same in production

2. **If ads don't work**:
   - Check AdMob dashboard for ad unit status
   - Verify ad unit IDs match exactly
   - Check console logs for specific errors
   - Ensure internet connection is stable

3. **To add Banner/Interstitial ads**:
   - Create ad units in AdMob dashboard
   - Update `PRODUCTION_AD_UNITS` in `utils/adConfig.ts`
   - Rebuild and test

## 📞 Support

If you encounter issues:
1. Check AdMob dashboard for ad unit status
2. Review console logs for error messages
3. Verify all ad unit IDs match exactly (no typos)
4. Ensure your AdMob account is approved and active

---

**Your current setup is ready for TestFlight testing!** The rewarded interstitial ad should work correctly with your production ad unit ID.
