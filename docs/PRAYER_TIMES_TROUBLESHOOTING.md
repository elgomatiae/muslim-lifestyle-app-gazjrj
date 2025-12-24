
# Prayer Times - Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Issue: Prayer times are still incorrect

#### Solution 1: Check Location Permission
1. Open the app
2. Go to **Profile → Notification Settings**
3. Check if "Location" shows "Granted"
4. If not, tap **"Request Permissions"**
5. Allow location access

#### Solution 2: Verify Device Timezone
1. Go to your device Settings
2. Check Date & Time settings
3. Ensure timezone is set correctly
4. Enable "Set Automatically" if available

#### Solution 3: Manual Refresh
1. Go to Home screen
2. Pull down to refresh, OR
3. Go to Notification Settings
4. Tap **"Refresh Prayer Times"**

#### Solution 4: Check GPS Signal
1. Ensure you're not in airplane mode
2. Try going outside for better GPS signal
3. Wait a few seconds for location to lock
4. Then refresh prayer times

---

### 🔴 Issue: Not receiving prayer notifications

#### Solution 1: Check Notification Permission
1. Go to **Profile → Notification Settings**
2. Verify "Notifications" shows "Granted"
3. If not, tap **"Request Permissions"**

#### Solution 2: Enable Prayer Notifications
1. In Notification Settings
2. Find "Prayer Times" toggle
3. Make sure it's turned ON (green)

#### Solution 3: Check System Settings
**iOS:**
1. Go to device Settings
2. Find your app
3. Tap Notifications
4. Ensure "Allow Notifications" is ON

**Android:**
1. Go to device Settings
2. Apps → Your App
3. Notifications
4. Ensure notifications are enabled

#### Solution 4: Verify Scheduled Notifications
1. Go to Notification Settings
2. Check "Scheduled Notifications" count
3. Should show 5 (one for each prayer)
4. If 0, try refreshing prayer times

---

### 🔴 Issue: Location permission denied

#### Solution: Grant Permission in System Settings

**iOS:**
1. Go to device Settings
2. Find your app in the list
3. Tap Location
4. Select "While Using the App"
5. Return to app and refresh

**Android:**
1. Go to device Settings
2. Apps → Your App
3. Permissions
4. Location → Allow
5. Return to app and refresh

---

### 🔴 Issue: Prayer times not updating daily

#### Solution 1: Check Background Refresh
**iOS:**
1. Settings → General
2. Background App Refresh
3. Enable for your app

**Android:**
1. Settings → Apps
2. Your App → Battery
3. Allow background activity

#### Solution 2: Manual Daily Refresh
- Simply open the app once a day
- Prayer times will auto-refresh
- Or use pull-to-refresh

---

### 🔴 Issue: Times are off by exactly 1 hour

This was the original bug and should now be fixed. If you still see this:

#### Solution:
1. Ensure you have the latest app version
2. Check if daylight saving time just changed
3. Refresh prayer times manually
4. Verify device timezone is correct
5. Try restarting the app

---

### 🔴 Issue: "Loading prayer times..." never finishes

#### Solution 1: Check Internet Connection
- Prayer times need internet for first calculation
- After that, they work offline
- Connect to WiFi or mobile data
- Try again

#### Solution 2: Check Location Services
- Ensure location services are enabled on device
- Not just for the app, but system-wide
- iOS: Settings → Privacy → Location Services
- Android: Settings → Location

#### Solution 3: Restart App
1. Close the app completely
2. Wait a few seconds
3. Reopen the app
4. Wait for location to lock

---

### 🔴 Issue: Different times than local mosque

This is normal and expected. Here's why:

#### Explanation:
- App uses Muslim World League calculation method
- Mosques may use different methods
- Local mosques may add safety margins
- Some mosques follow local sighting

#### Solution:
- App times are astronomically accurate
- If you prefer mosque times, note the difference
- Future update will allow custom adjustments
- For now, you can mentally adjust (+/- minutes)

---

### 🔴 Issue: Next prayer countdown not updating

#### Solution:
1. This updates every minute
2. If stuck, pull to refresh
3. Or close and reopen app
4. Check if device time is correct

---

### 🔴 Issue: App crashes when opening

#### Solution 1: Clear Cache
**iOS:**
1. Delete and reinstall app
2. Your data is saved in cloud

**Android:**
1. Settings → Apps → Your App
2. Storage → Clear Cache
3. Don't clear data (keeps your progress)

#### Solution 2: Update App
- Check app store for updates
- Install latest version
- Restart device

---

### 🔴 Issue: Battery drain

The prayer time system is designed to be efficient, but if you notice battery drain:

#### Solution:
1. Location is only used briefly for calculations
2. Not constantly tracking
3. Check other apps aren't using location
4. Ensure "High Accuracy" location isn't always on
5. Prayer times cache locally after first calculation

---

## 🆘 Still Having Issues?

### Before Contacting Support:

1. ✅ Read this troubleshooting guide
2. ✅ Check the Quick Start guide
3. ✅ Verify all permissions are granted
4. ✅ Try manual refresh
5. ✅ Restart the app
6. ✅ Check device timezone

### Information to Provide:

When reporting an issue, include:
- Device type (iPhone/Android)
- OS version
- App version
- Your location (city/country)
- What you expected vs what happened
- Screenshots if possible
- Steps to reproduce

---

## 📱 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Location permission granted?
- [ ] Notification permission granted?
- [ ] Prayer notifications toggle ON?
- [ ] Device timezone correct?
- [ ] Internet connection available?
- [ ] Location services enabled on device?
- [ ] App is latest version?
- [ ] Tried manual refresh?
- [ ] Tried pull-to-refresh?
- [ ] Tried restarting app?

If all checked and still having issues, contact support.

---

## 🔧 Advanced Troubleshooting

### Check Scheduled Notifications (Developers)
```javascript
// In notification settings, check the count
// Should show 5 scheduled notifications
// One for each prayer time
```

### Verify Location Data
```javascript
// Location should show:
// - Latitude and longitude
// - Timezone
// - City/country (optional)
```

### Check Prayer Time Cache
```javascript
// Prayer times are cached at:
// @prayer_times
// @prayer_location
// @last_prayer_calculation
```

---

## 💡 Tips for Best Experience

1. **Grant permissions on first launch**
   - Makes setup seamless
   - Ensures accurate times from start

2. **Keep location services enabled**
   - Only used briefly for calculations
   - Allows automatic updates when traveling

3. **Enable background refresh**
   - Ensures daily auto-updates
   - Keeps notifications scheduled

4. **Check app daily**
   - Opens app to verify times
   - Ensures everything is working

5. **Refresh when traveling**
   - Manual refresh in new location
   - Gets accurate times for new area

---

## 🌟 Prevention Tips

- Keep app updated
- Don't deny permissions
- Check settings periodically
- Refresh after traveling
- Verify times occasionally

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Next prayer card shows on home screen
- ✅ Countdown timer updates
- ✅ All 5 prayers show calculated times
- ✅ Scheduled notifications count shows 5
- ✅ Notifications arrive at correct times
- ✅ No warning messages appear

---

*Most issues can be resolved by ensuring permissions are granted and manually refreshing prayer times. The system is designed to be reliable and accurate once properly set up.*
