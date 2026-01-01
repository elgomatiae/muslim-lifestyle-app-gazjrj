
# Automatic Prayer Time Calculation System

## Overview

The Muslim Life Hub app **automatically calculates prayer times** based on the user's GPS location. Users do NOT manually calculate prayer times - the system does this automatically using the `adhan` library and the user's coordinates.

## How It Works

### 1. **Automatic Location Detection**
- The app requests location permissions on first launch
- Uses `expo-location` for high-accuracy GPS positioning
- Automatically detects when the user moves to a new location (>5km)
- Recalculates prayer times when location changes significantly

### 2. **Prayer Time Calculation**
- Uses the `adhan` library (industry-standard Islamic prayer time calculator)
- Calculates times based on:
  - User's GPS coordinates (latitude & longitude)
  - Selected calculation method (default: ISNA/North America)
  - Current date and timezone
  - Optional user adjustments (fine-tuning in minutes)

### 3. **Calculation Methods**
The app supports 12 different Islamic calculation methods:
- **ISNA (North America)** - Recommended for US/Canada (default)
- Muslim World League
- Egyptian General Authority
- University of Islamic Sciences, Karachi
- Umm al-Qura University, Makkah
- Dubai
- Qatar
- Kuwait
- Moonsighting Committee
- Singapore
- Institute of Geophysics, University of Tehran
- Turkey

### 4. **Smart Caching**
- Prayer times are cached for 24 hours
- Automatically refreshed at midnight
- Recalculated when location changes significantly
- Stored in Supabase database for persistence

## User Experience

### What Users See:
1. **Automatic Calculation**: Prayer times appear automatically based on their location
2. **Location Indicator**: Shows the city/location used for calculation
3. **Accuracy Badge**: Displays GPS accuracy (e.g., ±50m)
4. **Next Prayer Card**: Highlights the upcoming prayer with countdown

### What Users Can Do:
1. **Choose Calculation Method**: Select the method that matches their local mosque
2. **Fine-Tune Times**: Add/subtract minutes to match local mosque times exactly
3. **Refresh**: Pull to refresh to get fresh GPS location and recalculate

### What Users CANNOT Do:
- Manually enter prayer times
- Calculate times without GPS location
- Override the automatic calculation system

## Technical Implementation

### Key Files:
- `utils/prayerTimeService.ts` - Main prayer time calculation logic
- `utils/locationService.ts` - GPS location handling
- `contexts/NotificationContext.tsx` - Prayer time notifications
- `app/(tabs)/(home)/index.tsx` - Home screen displaying prayer times
- `app/(tabs)/profile/prayer-settings.tsx` - Settings for calculation method and adjustments

### Key Functions:

#### `calculatePrayerTimes(location, methodName)`
Automatically calculates prayer times based on GPS coordinates:
```typescript
const coordinates = new Coordinates(location.latitude, location.longitude);
const params = getCalculationParams(method);
const prayerTimes = new PrayerTimes(coordinates, date, params);
```

#### `getPrayerTimes(forceRefresh)`
Main function to retrieve prayer times:
1. Checks cache for today's times
2. Checks if location changed significantly
3. Gets fresh GPS location if needed
4. Calculates prayer times
5. Stores in database and cache

#### `refreshPrayerTimes()`
Forces recalculation with fresh GPS location:
1. Clears all caches
2. Gets high-accuracy GPS location
3. Recalculates prayer times
4. Updates database and cache

### Database Schema:

#### `prayer_times` table:
Stores calculated prayer times for each user:
```sql
- user_id: UUID
- date: DATE
- location_name: TEXT
- latitude: NUMERIC
- longitude: NUMERIC
- fajr_time: TIME
- dhuhr_time: TIME
- asr_time: TIME
- maghrib_time: TIME
- isha_time: TIME
- calculation_method: TEXT
- is_manual: BOOLEAN (always false for auto-calculated)
- timezone: TEXT
```

#### `prayer_time_adjustments` table:
Stores user's fine-tuning adjustments (in minutes):
```sql
- user_id: UUID
- fajr_offset: INTEGER
- dhuhr_offset: INTEGER
- asr_offset: INTEGER
- maghrib_offset: INTEGER
- isha_offset: INTEGER
```

## Location Accuracy

### High Accuracy Mode:
- Uses `Location.Accuracy.High` for precise GPS positioning
- Typically accurate to within 10-50 meters
- May take a few seconds to acquire location

### Fallback Mechanism:
If GPS location is unavailable:
1. Uses last known location (cached)
2. Falls back to Mecca coordinates (21.4225°N, 39.8262°E)
3. Shows warning to user to enable location permissions

## Automatic Updates

### Daily Refresh:
- Prayer times automatically refresh at midnight
- Ensures times are always current for the new day

### Location-Based Refresh:
- Monitors location changes in background
- Recalculates when user moves >5km
- Updates notifications automatically

### Manual Refresh:
- Pull-to-refresh on home screen
- Refresh button in prayer settings
- Gets fresh GPS location and recalculates

## Notifications

Prayer time notifications are automatically scheduled based on calculated times:
- Scheduled for each prayer time
- Updated when times change
- Respects user's notification preferences

## Error Handling

### Location Errors:
- Permission denied → Shows alert to enable location
- Services disabled → Uses cached location
- GPS unavailable → Falls back to last known location

### Calculation Errors:
- Invalid coordinates → Uses fallback location
- Library error → Returns default times
- Network error → Uses cached times

## Best Practices

### For Accurate Prayer Times:
1. **Enable Location Permissions**: Required for automatic calculation
2. **Choose Correct Method**: Select the method used by your local mosque
3. **Fine-Tune if Needed**: Add small adjustments to match mosque times exactly
4. **Keep Location Services On**: Ensures times update when you travel

### For Developers:
1. **Never Allow Manual Entry**: Prayer times must be calculated, not entered
2. **Always Use GPS**: Don't rely on user-provided coordinates
3. **Validate Calculations**: Ensure times are reasonable (e.g., Fajr before sunrise)
4. **Cache Intelligently**: Balance accuracy with battery life
5. **Handle Errors Gracefully**: Always provide fallback times

## Troubleshooting

### Prayer Times Inaccurate:
1. Check location permissions are granted
2. Verify GPS is enabled on device
3. Try different calculation method
4. Add fine-tuning adjustments
5. Refresh to get fresh GPS location

### Times Not Updating:
1. Pull to refresh on home screen
2. Check location services are enabled
3. Verify app has location permission
4. Clear cache and recalculate

### Location Not Detected:
1. Enable location services in device settings
2. Grant location permission to app
3. Ensure GPS has clear view of sky
4. Try moving to open area

## Future Enhancements

Potential improvements to the automatic system:
- [ ] Support for multiple locations (home, work, travel)
- [ ] Automatic timezone detection
- [ ] Qibla direction based on location
- [ ] Nearby mosque finder
- [ ] Community-verified prayer times
- [ ] Offline calculation support
- [ ] Background location updates

## Conclusion

The automatic prayer time calculation system ensures users always have accurate, location-based prayer times without any manual input. The system is designed to be:
- **Automatic**: No user intervention required
- **Accurate**: Uses GPS and proven calculation methods
- **Adaptive**: Updates when location changes
- **Reliable**: Multiple fallback mechanisms
- **User-Friendly**: Simple settings for customization

Users can trust that their prayer times are always correct for their current location, calculated using authentic Islamic methods.
