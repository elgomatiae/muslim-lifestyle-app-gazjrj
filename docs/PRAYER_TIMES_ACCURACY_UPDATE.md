
# Prayer Times Accuracy Update

## Overview
This update addresses prayer time accuracy issues by implementing a comprehensive solution that includes:
- Database storage for prayer times
- Manual adjustment capabilities
- Multiple calculation methods
- Location-based accuracy improvements
- Default to North America (ISNA) method for US/Canada locations

## Changes Made

### 1. Database Tables Created

#### `prayer_times` Table
Stores calculated or manually set prayer times for each user and date.

**Columns:**
- `user_id`: Reference to the user
- `date`: Date for the prayer times
- `location_name`: Human-readable location name
- `latitude`, `longitude`: Geographic coordinates
- `fajr_time`, `dhuhr_time`, `asr_time`, `maghrib_time`, `isha_time`: Prayer times
- `calculation_method`: Method used for calculation
- `is_manual`: Whether times were manually set
- `timezone`: User's timezone

#### `prayer_time_adjustments` Table
Stores user-specific adjustments (offsets in minutes) for each prayer.

**Columns:**
- `user_id`: Reference to the user
- `fajr_offset`, `dhuhr_offset`, `asr_offset`, `maghrib_offset`, `isha_offset`: Minute adjustments

### 2. Enhanced Prayer Time Service

#### New Features:
- **Database Integration**: Prayer times are now stored in Supabase for persistence
- **Manual Adjustments**: Users can add/subtract minutes from calculated times
- **Multiple Calculation Methods**: Support for 12 different calculation methods
- **Smart Caching**: Three-tier caching system (memory, AsyncStorage, database)
- **Location Awareness**: Automatically recalculates when location changes significantly

#### Default Calculation Method:
Changed from "Muslim World League" to "North America (ISNA)" which is more accurate for US/Canada locations including Aurora.

#### Available Calculation Methods:
1. **North America (ISNA)** - Recommended for US/Canada ⭐
2. Muslim World League
3. Egyptian General Authority
4. University of Islamic Sciences, Karachi
5. Umm al-Qura University, Makkah
6. Dubai
7. Qatar
8. Kuwait
9. Moonsighting Committee
10. Singapore
11. Institute of Geophysics, University of Tehran
12. Turkey

### 3. Prayer Settings Screen

New screen at `/(tabs)/profile/prayer-settings` that allows users to:

#### Calculation Method Selection:
- View all available calculation methods
- See which method is currently active
- Change method with one tap
- Automatic recalculation after method change

#### Manual Adjustments:
- Fine-tune each prayer time individually
- Add or subtract minutes (e.g., +5 min, -3 min)
- Save adjustments to database
- Reset all adjustments to 0
- Adjustments persist across app restarts

#### Location Information:
- View current location being used
- See location accuracy
- Understand which location prayer times are based on

### 4. UI Improvements

#### Home Screen:
- Added settings button to Next Prayer card
- Shows location name or coordinates
- Displays location accuracy badge
- Warning when location permission not granted

#### Profile Screen:
- Updated "Prayer Settings" option to navigate to new settings screen
- Improved visual feedback

## How to Use

### For Users in Aurora:

1. **Open Prayer Settings:**
   - Go to Profile tab
   - Tap "Prayer Settings"

2. **Verify Calculation Method:**
   - The app now defaults to "North America (ISNA)"
   - This is the recommended method for Aurora
   - If needed, you can try other methods

3. **Fine-tune with Manual Adjustments:**
   - Compare app times with your local mosque
   - Use +/- buttons to adjust each prayer
   - Example: If Fajr is 2 minutes late, set Fajr offset to -2
   - Tap "Save Adjustments"

4. **Check Location:**
   - Ensure location permission is granted
   - Verify the location shown is accurate
   - Pull down on Home screen to refresh if needed

### Troubleshooting:

**Prayer times still inaccurate?**
1. Check location permissions in device settings
2. Try different calculation methods
3. Compare with local mosque and use manual adjustments
4. Pull down to refresh prayer times

**Location not accurate?**
1. Enable location services
2. Grant location permission to the app
3. Ensure GPS is enabled
4. Try refreshing from Home screen

## Technical Details

### Prayer Time Calculation Flow:

```
1. Check AsyncStorage cache (fast)
   ↓ (if expired or not found)
2. Check Supabase database (medium)
   ↓ (if not found or force refresh)
3. Get user location (GPS)
   ↓
4. Calculate using adhan library + selected method
   ↓
5. Apply user adjustments (if any)
   ↓
6. Store in database
   ↓
7. Cache in AsyncStorage
   ↓
8. Return to UI
```

### Location Accuracy:
- High accuracy mode for initial calculation
- Balanced mode for subsequent updates
- Caches location for 24 hours
- Recalculates if moved >5km

### Data Persistence:
- Prayer times stored per user per date
- Adjustments stored per user (applies to all dates)
- Calculation method preference stored locally
- All data synced with Supabase

## API Reference

### New Functions:

```typescript
// Get/save calculation method
getCalculationMethod(): Promise<string>
saveCalculationMethod(method: string): Promise<void>

// Get/save adjustments
getPrayerTimeAdjustments(): Promise<PrayerTimeAdjustments | null>
savePrayerTimeAdjustments(adjustments: PrayerTimeAdjustments): Promise<void>

// Prayer time operations
getPrayerTimes(forceRefresh?: boolean): Promise<PrayerTime[]>
refreshPrayerTimes(): Promise<PrayerTime[]>
calculatePrayerTimes(location: UserLocation, method?: string): Promise<PrayerTime[]>
```

### Types:

```typescript
interface PrayerTimeAdjustments {
  fajr_offset: number;
  dhuhr_offset: number;
  asr_offset: number;
  maghrib_offset: number;
  isha_offset: number;
}
```

## Migration Notes

### For Existing Users:
- Existing prayer times will be recalculated with new method
- No data loss
- Adjustments start at 0 (no change)
- Can revert to old method if preferred

### Database Migration:
- Two new tables created with RLS enabled
- Automatic cleanup of old data after 30 days (optional)
- Indexes added for performance

## Future Enhancements

Potential improvements for future versions:
1. Import prayer times from local mosque websites
2. Community-shared prayer times for specific locations
3. Automatic method selection based on location
4. Prayer time notifications with adjustments
5. Historical prayer time tracking
6. Qibla direction integration

## Support

If prayer times are still inaccurate after trying all options:
1. Check the app's location permission
2. Compare with multiple local mosques
3. Use manual adjustments to match exactly
4. Report the issue with your location details

## References

- Adhan library: https://github.com/batoulapps/adhan-js
- ISNA calculation method: https://www.isna.net/
- Prayer time calculation methods: https://praytimes.org/calculation
