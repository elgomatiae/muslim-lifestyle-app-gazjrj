
# Prayer Times System Guide

## Overview

The app now uses an accurate prayer time calculation system based on your actual location. Prayer times are calculated using the **Adhan** library, which implements precise astronomical calculations following Islamic jurisprudence.

## Features

### ✅ Accurate Location-Based Calculations
- Prayer times are calculated based on your GPS coordinates
- Automatically detects your timezone
- Updates when you change locations

### ✅ Automatic Notifications
- Receive notifications at each prayer time
- Notifications are scheduled based on calculated times
- Can be enabled/disabled in notification settings

### ✅ Daily Auto-Refresh
- Prayer times automatically refresh at midnight
- Pull-to-refresh to manually update times
- Recalculates when location permission is granted

### ✅ Next Prayer Display
- Shows the next upcoming prayer
- Displays countdown timer
- Updates in real-time

## How It Works

### 1. Location Permission
The app needs location permission to calculate accurate prayer times:
- Go to **Profile → Notification Settings**
- Tap **"Request Permissions"**
- Grant location access when prompted

### 2. Prayer Time Calculation
The system uses:
- **Calculation Method**: Muslim World League (default)
- **Madhab**: Shafi (can be customized)
- **High Latitude Rule**: Middle of the Night

### 3. Notification Scheduling
When prayer notifications are enabled:
- Notifications are scheduled for each prayer time
- Uses your device's local timezone
- Automatically reschedules daily

## Calculation Methods

The app supports multiple calculation methods (can be customized in future updates):

- **Muslim World League** (Default)
- **Egyptian General Authority**
- **University of Islamic Sciences, Karachi**
- **Umm Al-Qura University, Makkah**
- **Dubai**
- **Qatar**
- **Kuwait**
- **Moonsighting Committee**
- **Singapore**
- **North America (ISNA)**
- **Tehran**

## Madhab Options

- **Shafi** (Default) - Used for Asr calculation
- **Hanafi** - Alternative Asr calculation

## Troubleshooting

### Prayer times are incorrect
1. **Check location permission**: Go to Notification Settings and ensure location is granted
2. **Refresh prayer times**: Pull down on the home screen to refresh
3. **Check timezone**: Ensure your device timezone is set correctly

### Notifications are not working
1. **Check notification permission**: Go to Notification Settings
2. **Enable prayer notifications**: Toggle "Prayer Times" switch
3. **Check scheduled notifications**: View count in Notification Settings

### Times are still off by an hour
This was the original issue - it's now fixed! The system:
- Uses your actual GPS location
- Calculates times in your local timezone
- Accounts for daylight saving time automatically

### Location permission denied
If you denied location permission:
1. Go to your device Settings
2. Find the app
3. Enable Location permission
4. Return to app and refresh

## Privacy

- Location data is only used for prayer time calculations
- Location is not stored on servers
- Cached locally for offline use
- No tracking or data sharing

## Technical Details

### Storage
- Prayer times cached locally
- Location cached for offline use
- Recalculated daily at midnight
- Notification IDs stored for management

### Accuracy
- Uses astronomical calculations
- Accounts for:
  - Latitude and longitude
  - Timezone
  - Daylight saving time
  - High latitude adjustments

### Performance
- Calculations are instant
- Minimal battery impact
- Efficient notification scheduling
- Smart caching system

## Future Enhancements

Planned features:
- [ ] Custom calculation method selection
- [ ] Madhab preference setting
- [ ] Qibla direction
- [ ] Nearby mosques
- [ ] Prayer time adjustments (+/- minutes)
- [ ] Multiple location profiles
- [ ] Athan (call to prayer) audio

## Support

If you experience issues:
1. Check this guide first
2. Try refreshing prayer times
3. Verify permissions are granted
4. Check device timezone settings

The prayer time system is designed to be accurate, reliable, and respectful of your privacy while helping you maintain your daily prayers.
