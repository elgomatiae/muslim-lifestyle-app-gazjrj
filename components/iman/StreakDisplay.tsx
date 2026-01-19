/**
 * ============================================================================
 * STREAK DISPLAY COMPONENT
 * ============================================================================
 * 
 * Beautiful, visually appealing streak display component
 * Shows current streak, longest streak, and total days active
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { getCurrentStreak, StreakData } from '@/utils/streakTracker';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

interface StreakDisplayProps {
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onPress?: () => void;
}

export default function StreakDisplay({ 
  size = 'medium', 
  showDetails = true,
  onPress 
}: StreakDisplayProps) {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    lastActiveDate: '',
  });
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadStreakData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStreakData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadStreakData = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getCurrentStreak(user.id);
      setStreakData(data);
      
      // Pulse animation for active streaks
      if (data.currentStreak > 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const getStreakColor = (): string => {
    if (streakData.currentStreak >= 30) return '#FFD700'; // Gold
    if (streakData.currentStreak >= 14) return '#FF6B6B'; // Red
    if (streakData.currentStreak >= 7) return '#FF8C42'; // Orange
    if (streakData.currentStreak >= 3) return '#FFB84D'; // Light Orange
    return '#FF6B6B'; // Default red
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          containerHeight: 80,
          iconSize: 32,
          titleSize: 14,
          countSize: 24,
          subtitleSize: 12,
        };
      case 'large':
        return {
          containerHeight: 160,
          iconSize: 64,
          titleSize: 18,
          countSize: 48,
          subtitleSize: 16,
        };
      default: // medium
        return {
          containerHeight: 120,
          iconSize: 48,
          titleSize: 16,
          countSize: 36,
          subtitleSize: 14,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const streakColor = getStreakColor();

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={[streakColor + 'FF', streakColor + 'DD', streakColor + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          { 
            height: sizeStyles.containerHeight,
            borderRadius: borderRadius.lg,
          }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="local-fire-department"
              size={sizeStyles.iconSize}
              color={colors.card}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { fontSize: sizeStyles.titleSize }]}>
              {streakData.currentStreak} Day{streakData.currentStreak !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.subtitle, { fontSize: sizeStyles.subtitleSize }]}>
              Current Streak
            </Text>
          </View>

          {showDetails && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.card + 'CC'}
                />
                <Text style={styles.detailText}>{streakData.longestStreak}</Text>
              </View>
              <View style={styles.detailItem}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={16}
                  color={colors.card + 'CC'}
                />
                <Text style={styles.detailText}>{streakData.totalDaysActive}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: streakColor + '40' }]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.bold,
    color: colors.card,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.regular,
    color: colors.card + 'DD',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  detailText: {
    ...typography.regular,
    fontSize: 12,
    color: colors.card + 'CC',
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.6,
  },
});
