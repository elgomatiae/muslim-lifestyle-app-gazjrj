
# Iman Score Calculation System

## Overview

The Iman Score system has been completely redesigned to:
- **Properly weight daily vs weekly goals** - Daily goals build consistency, weekly goals provide flexibility
- **Encourage consistent engagement** - Gentle decay with momentum rewards
- **Make returning easy** - Fast recovery with positive reinforcement
- **Accurately reflect progress** - No unearned credit, clear scoring breakdown

## Scoring Structure

### Overall Iman Score (0-100%)
- **Ibadah (Worship): 50%** - Foundation of faith
- **Ilm (Knowledge): 25%** - Understanding and learning
- **Amanah (Well-Being): 25%** - Balance and health

### Ibadah Score (0-100 points)

#### Daily Activities (70 points)
- **Fard Prayers: 40 points** - Only counts prayers that have passed
- **Sunnah Prayers: 10 points** - Daily recommended prayers
- **Quran Pages: 8 points** - Daily Quran reading
- **Quran Verses: 7 points** - Alternative to pages
- **Daily Dhikr: 5 points** - Daily remembrance

#### Weekly Activities (30 points)
- **Tahajjud: 8 points** - Night prayer
- **Quran Memorization: 10 points** - Long-term Quran goal
- **Weekly Dhikr: 7 points** - Weekly dhikr target
- **Fasting: 5 points** - Optional fasting

### Ilm Score (0-100 points)

All weekly goals (knowledge accumulates over time):
- **Lectures: 35 points** - Primary learning source
- **Recitations: 30 points** - Listening to Quran
- **Quizzes: 20 points** - Testing knowledge
- **Reflection: 15 points** - Deep understanding

### Amanah Score (0-100 points)

#### Daily Activities (60 points)
- **Exercise: 20 points** - Daily movement
- **Water: 15 points** - Hydration
- **Sleep: 25 points** - Rest and recovery

#### Weekly Activities (40 points)
- **Workout: 20 points** - Structured exercise
- **Mental Health: 12 points** - Mental wellness
- **Stress Management: 8 points** - Stress reduction

## Decay System

### Philosophy
Iman is treated like momentum - it fades gradually with inactivity but never disappears instantly.

### Key Features

1. **Grace Period: 18 hours**
   - Almost a full day before decay begins
   - Allows flexibility for busy schedules

2. **Gentle Decay: 8% per day**
   - Slow, continuous decline
   - Maximum 20% decay per day
   - Never drops below 0%

3. **Momentum System**
   - Build momentum: +5% per consecutive active day (max +50%)
   - Lose momentum: -10% per inactive day
   - Rewards consistency without punishing occasional misses

4. **Fast Recovery: 30% boost**
   - When returning after inactivity
   - Small actions restore progress quickly
   - Positive reinforcement for coming back

### How It Works

```
Day 1: Active → Score: 80% → Momentum: 1.05x
Day 2: Active → Score: 85% → Momentum: 1.10x
Day 3: Inactive → Score: 85% (grace period)
Day 4: Inactive → Score: 77% (-8% decay)
Day 5: Active → Score: 82% (+30% recovery boost)
```

## Scoring Examples

### Example 1: Consistent User
- Completes all 5 fard prayers: 40 points
- Completes 3/5 sunnah prayers: 6 points
- Reads 1/2 pages of Quran: 4 points
- Completes 50/100 daily dhikr: 2.5 points
- **Daily Ibadah Score: 52.5/70 = 75%**

### Example 2: Weekend Warrior
- Completes 3/5 fard prayers: 24 points
- No sunnah prayers: 0 points
- Watches 2/2 lectures: 35 points (weekly)
- Completes 1/1 quiz: 20 points (weekly)
- **Ibadah: 34%, Ilm: 55%**

### Example 3: Returning User
- Previous score: 45%
- New activity: Completes Fajr prayer
- Fresh score: 8% (just one prayer)
- **Final score: 45% + ((8% - 45%) × 1.3) = 45%** (decay prevents drop)
- Next prayer: Score jumps to 16% (recovery boost)

## Benefits

### For Users
1. **Clear Progress Tracking** - Know exactly what contributes to your score
2. **Flexible Goals** - Mix of daily and weekly targets
3. **Forgiving System** - Missing a day doesn't ruin your progress
4. **Motivating Recovery** - Easy to bounce back after inactivity
5. **Realistic Reflection** - Score accurately shows your engagement

### For Engagement
1. **Daily Habits** - Weighted heavily to build consistency
2. **Weekly Flexibility** - Accommodates busy schedules
3. **Momentum Rewards** - Consistency builds multipliers
4. **Return Incentives** - Fast recovery encourages coming back
5. **No Punishment** - Gentle decay, not harsh penalties

## Technical Implementation

### Score Calculation
```typescript
// Fresh score based on current goals
const freshScore = calculateScore(goals);

// Apply decay based on inactivity
const decayedScore = applyDecay(previousScore, hoursSinceActivity);

// Take the higher value (new activity always helps)
const finalScore = Math.max(freshScore, decayedScore);
```

### Momentum System
```typescript
// Build momentum with consistency
if (consecutiveDaysActive > 0) {
  momentumMultiplier += 0.05; // +5% per day
}

// Lose momentum with inactivity
if (consecutiveDaysInactive > 0) {
  momentumMultiplier -= 0.10; // -10% per day
}

// Apply to recovery
recoveredScore = currentScore + ((freshScore - currentScore) × 1.3 × momentumMultiplier);
```

## Migration Notes

### Changes from Previous System
1. **Removed component-level decay** - Simplified to section-level
2. **Added momentum system** - Rewards consistency
3. **Improved weighting** - Daily goals more important
4. **Faster recovery** - 30% boost when returning
5. **Clearer scoring** - Explicit point values

### Backward Compatibility
- All existing interfaces maintained
- Legacy functions still work
- Gradual migration path
- No data loss

## Future Enhancements

1. **Personalized Weights** - Let users adjust importance
2. **Streak Bonuses** - Extra points for long streaks
3. **Community Challenges** - Group goals and competitions
4. **Seasonal Adjustments** - Ramadan, Hajj, etc.
5. **AI Recommendations** - Personalized goal suggestions
