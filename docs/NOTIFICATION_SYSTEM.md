
# Notification System Documentation

## Overview

The Muslim Life Hub app now includes a comprehensive notification system that helps users stay on track with their Islamic practices and goals. The system supports both local notifications and location-based features.

## Features

### 1. **Prayer Time Notifications** 🕌
- Automatic notifications for all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Customizable prayer times
- Location-based prayer time calculations (when location permission is granted)

### 2. **Daily Content Notifications** 📖
- Daily Quran verse notification (8:00 AM)
- Daily Hadith notification (8:00 AM)
- Inspirational Islamic content

### 3. **Iman Score Notifications** 📊
- Daily Iman score updates (9:00 PM)
- Progress tracking reminders
- Milestone achievements

### 4. **Iman Tracker Notifications** 🎯
- Goal progress updates
- Milestone celebrations
- Streak reminders

### 5. **Goal Reminder Notifications** ⏰
- Morning reminder (10:00 AM)
- Evening check-in (7:00 PM)
- Customizable reminder times

### 6. **Achievement Notifications** 🏆
- Instant notifications when achievements are unlocked
- Milestone celebrations
- Progress updates

## Permissions

### Notification Permission
Required for all notification features. The app will request this permission on first use.

**What it enables:**
- Local notifications
- Scheduled reminders
- Achievement alerts

### Location Permission
Optional but recommended for accurate prayer times.

**What it enables:**
- Location-based prayer time calculations
- Automatic prayer time adjustments
- Regional Islamic calendar events

## How to Use

### 1. Enable Notifications

1. Open the app and navigate to **Profile** tab
2. Tap on **Notifications** option
3. Tap **Request Permissions** button
4. Grant notification and location permissions when prompted

### 2. Customize Notification Settings

In the Notification Settings screen, you can toggle:

- **Prayer Times**: Enable/disable prayer time notifications
- **Daily Content**: Enable/disable daily verse and hadith notifications
- **Iman Score**: Enable/disable daily score updates
- **Iman Tracker**: Enable/disable progress notifications
- **Goal Reminders**: Enable/disable goal reminder notifications
- **Achievements**: Enable/disable achievement unlock notifications

### 3. View Notification Status

The Notification Settings screen shows:
- Number of scheduled notifications
- Permission status for notifications
- Permission status for location

## Technical Implementation

### Architecture

The notification system consists of:

1. **NotificationService** (`utils/notificationService.ts`)
   - Core notification logic
   - Permission handling
   - Notification scheduling
   - Supabase integration

2. **NotificationContext** (`contexts/NotificationContext.tsx`)
   - React context for notification state
   - Settings management
   - Permission requests

3. **NotificationSettings Screen** (`app/(tabs)/notification-settings.tsx`)
   - User interface for managing notifications
   - Permission requests
   - Settings toggles

4. **Database Table** (`notification_preferences`)
   - Stores user notification preferences
   - Syncs across devices
   - Row Level Security enabled

### Notification Channels (Android)

The app creates the following notification channels:

1. **Default**: General notifications
2. **Prayers**: Prayer time notifications (High priority)
3. **Daily Content**: Daily verse and hadith (Default priority)
4. **Iman Tracker**: Progress and goals (Default priority)

### Notification Scheduling

Notifications are scheduled using:
- **Daily triggers**: For recurring daily notifications
- **Time interval triggers**: For one-time or interval-based notifications
- **Immediate triggers**: For instant notifications (achievements, milestones)

## Data Storage

### Local Storage (AsyncStorage)
- Notification settings
- Scheduled notification IDs
- Offline access to preferences

### Supabase Database
- User notification preferences
- Cross-device synchronization
- Backup and restore

## Privacy & Security

- All notification data is stored locally and in user's Supabase account
- Location data is only used for prayer time calculations
- No notification data is shared with third parties
- Users can revoke permissions at any time
- Row Level Security ensures users can only access their own data

## Troubleshooting

### Notifications Not Appearing

1. **Check Permissions**
   - Go to Notification Settings
   - Verify notification permission is granted
   - Re-request permissions if needed

2. **Check Device Settings**
   - Ensure notifications are enabled in device settings
   - Check Do Not Disturb mode
   - Verify app notification settings in system settings

3. **Check Scheduled Notifications**
   - View scheduled notification count in settings
   - If count is 0, try toggling notification types off and on

### Location Not Working

1. **Check Location Permission**
   - Verify location permission is granted
   - Some devices require "Always Allow" for background location

2. **Check Location Services**
   - Ensure location services are enabled on device
   - Check GPS signal strength

### Notifications Delayed

- Android may delay notifications to save battery
- Check battery optimization settings for the app
- Disable battery optimization for Muslim Life Hub

## Future Enhancements

Planned features for future releases:

1. **Custom Prayer Times**
   - Manual prayer time adjustment
   - Multiple calculation methods
   - Timezone support

2. **Smart Notifications**
   - AI-powered notification timing
   - Adaptive reminder frequency
   - Context-aware notifications

3. **Notification History**
   - View past notifications
   - Notification analytics
   - Engagement tracking

4. **Group Notifications**
   - Community prayer reminders
   - Group challenge notifications
   - Social features

5. **Advanced Scheduling**
   - Custom notification times
   - Recurring patterns
   - Holiday adjustments

## Support

For issues or questions about notifications:
1. Check this documentation
2. Review the troubleshooting section
3. Contact support through the app

---

**Note**: This notification system requires expo-notifications, expo-location, expo-device, and expo-task-manager packages. All dependencies are included in the project.
