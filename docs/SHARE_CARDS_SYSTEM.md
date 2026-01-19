# Share Cards System Documentation

## Overview
The share cards system automatically generates beautiful, shareable visual cards for achievements, streaks, and milestones. Users can share these cards to Instagram Stories, Snapchat, WhatsApp, and other platforms.

## Features

### Auto-Generated Cards
- **Prayer Streak**: "30 days of consistent prayer"
- **Workout Streak**: "14 days of consistent workouts"
- **Quran Streak**: "7 days of Quran reading"
- **Iman Score**: "Highest Iman score yet: 95%"
- **Prayer Percentage**: "100% Fard prayers this week"
- **Achievements**: Custom achievement cards
- **Milestones**: Special milestone celebrations

### Share Platforms
- **General Share**: Uses native share sheet (all platforms)
- **Instagram Stories**: Direct integration (iOS)
- **WhatsApp**: Direct link sharing
- **Snapchat**: App integration
- **Other platforms**: Via native share sheet

## Installation

To enable full image sharing functionality, install these packages:

```bash
npx expo install expo-sharing
npx expo install react-native-view-shot
npx expo install expo-file-system
```

## Usage

### Basic Share Button

```tsx
import ShareButton from '@/components/share/ShareButton';
import { generatePrayerStreakCard } from '@/utils/shareCardGenerator';

const shareData = generatePrayerStreakCard(30);

<ShareButton data={shareData} />
```

### Share Modal

```tsx
import ShareCardModal from '@/components/share/ShareCardModal';
import { generateWorkoutStreakCard } from '@/utils/shareCardGenerator';

const [showModal, setShowModal] = useState(false);
const shareData = generateWorkoutStreakCard(14);

<ShareCardModal
  visible={showModal}
  data={shareData}
  onClose={() => setShowModal(false)}
/>
```

### Auto-Share on Milestones

```tsx
import { generateShareCardForMilestone, shouldSuggestShare } from '@/utils/autoShareService';

const event = {
  type: 'prayer_streak',
  value: 30,
  isNewRecord: false,
};

if (shouldSuggestShare(event)) {
  const shareCard = generateShareCardForMilestone(event);
  // Show share modal or notification
}
```

## Card Types

### Prayer Streak Card
- Triggered when all 5 prayers are completed
- Suggested at: 3, 7, 14, 30, 60, 90, 100, 180, 365 days
- Green gradient theme

### Workout Streak Card
- Triggered when workout is completed
- Suggested at: 3, 7, 14, 30, 60, 90, 100 days
- Amber gradient theme

### Quran Streak Card
- Triggered when Quran is read
- Suggested at: 3, 7, 14, 30, 60, 90, 100 days
- Blue gradient theme

### Iman Score Card
- Triggered when new highest score is achieved
- Purple gradient theme

### Prayer Percentage Card
- Triggered when 100% prayers completed in a period
- Green gradient theme

## Integration Points

### Streaks
- Share buttons automatically appear on streak cards in `AllStreaksDisplay`
- Cards are generated based on current streak values

### Achievements
- Can be integrated into achievement unlock celebrations
- Use `generateAchievementCard()` function

### Iman Score
- Can be added to Iman tracker screen
- Use `generateImanScoreCard()` function

## Customization

### Custom Gradients
Modify `getShareCardGradient()` in `shareCardGenerator.ts` to change colors.

### Custom Icons
Modify `getShareCardIcon()` in `shareCardGenerator.ts` to change icons.

### Custom Templates
Create new card types by adding to `ShareCardType` and implementing generator functions.

## Future Enhancements

1. **Image Capture**: Full implementation with `react-native-view-shot` for actual image sharing
2. **Custom Text**: Allow users to add personal messages
3. **Templates**: Multiple design templates to choose from
4. **Analytics**: Track which cards are shared most
5. **Social Integration**: Direct API integration with platforms

## Notes

- Currently uses text-based sharing as fallback
- Full image sharing requires additional packages (see Installation)
- Share cards are optimized for Instagram Stories dimensions (1080x1920)
- All cards include app branding
