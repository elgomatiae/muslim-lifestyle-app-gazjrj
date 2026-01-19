/**
 * ============================================================================
 * STREAK CARD COMPONENT
 * ============================================================================
 * 
 * Full-featured streak card with detailed information
 * Perfect for profile pages and detailed views
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { getCurrentStreak, StreakData, checkAndUpdateStreak } from '@/utils/streakTracker';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

interface StreakCardProps {
  onPress?: () => void;
}

export default function StreakCard({ onPress }: StreakCardProps) {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    lastActiveDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
    
    // Refresh every minute
    const interval = setInterval(loadStreakData, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadStreakData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Check and update streak first
      await checkAndUpdateStreak(user.id);
      const data = await getCurrentStreak(user.id);
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStreakColor = (): string => {
    if (streakData.currentStreak >= 30) return '#FFD700'; // Gold
    if (streakData.currentStreak >= 14) return '#FF6B6B'; // Red
    if (streakData.currentStreak >= 7) return '#FF8C42'; // Orange
    if (streakData.currentStreak >= 3) return '#FFB84D'; // Light Orange
    return '#FF6B6B'; // Default red
  };

  const getStreakMessage = (): string => {
    if (streakData.currentStreak === 0) {
      return 'Start your streak today!';
    }
    if (streakData.currentStreak === 1) {
      return 'Great start! Keep it going!';
    }
    if (streakData.currentStreak < 7) {
      return `You're on fire! ${7 - streakData.currentStreak} more days until a week!`;
    }
    if (streakData.currentStreak < 30) {
      return `Amazing! ${30 - streakData.currentStreak} more days until a month!`;
    }
    if (streakData.currentStreak < 100) {
      return `Incredible dedication! Keep going!`;
    }
    return `Legendary! You're unstoppable!`;
  };

  const streakColor = getStreakColor();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading streak...</Text>
      </View>
    );
  }

  const CardContent = (
    <LinearGradient
      colors={[streakColor + 'FF', streakColor + 'DD', streakColor + 'BB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="flame.fill"
            android_material_icon_name="local-fire-department"
            size={40}
            color={colors.card}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Activity Streak</Text>
            <Text style={styles.headerSubtitle}>{getStreakMessage()}</Text>
          </View>
        </View>
      </View>

      {/* Main Streak Display */}
      <View style={styles.mainDisplay}>
        <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
        <Text style={styles.streakLabel}>
          Day{streakData.currentStreak !== 1 ? 's' : ''} in a Row
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={24}
            color={colors.card + 'DD'}
          />
          <Text style={styles.statValue}>{streakData.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statItem}>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={24}
            color={colors.card + 'DD'}
          />
          <Text style={styles.statValue}>{streakData.totalDaysActive}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      {streakData.currentStreak > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[colors.card + 'FF', colors.card + 'AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (streakData.currentStreak / 30) * 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {streakData.currentStreak < 30 
              ? `${30 - streakData.currentStreak} days until 30-day milestone`
              : '30-day milestone achieved! 🎉'}
          </Text>
        </View>
      )}

      {/* Glow effects */}
      <View style={[styles.glow1, { backgroundColor: streakColor + '30' }]} />
      <View style={[styles.glow2, { backgroundColor: streakColor + '20' }]} />
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  loadingText: {
    ...typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  headerTitle: {
    ...typography.bold,
    fontSize: 20,
    color: colors.card,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    ...typography.regular,
    fontSize: 14,
    color: colors.card + 'DD',
  },
  mainDisplay: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  streakNumber: {
    ...typography.bold,
    fontSize: 64,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  streakLabel: {
    ...typography.regular,
    fontSize: 18,
    color: colors.card + 'DD',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.bold,
    fontSize: 24,
    color: colors.card,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.regular,
    fontSize: 14,
    color: colors.card + 'CC',
  },
  progressContainer: {
    marginTop: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.card + '40',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.regular,
    fontSize: 12,
    color: colors.card + 'CC',
    textAlign: 'center',
  },
  glow1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  glow2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.4,
  },
});
