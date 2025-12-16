
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export default function FastingTracker() {
  const [isFasting, setIsFasting] = useState(false);
  const [weeklyFastingCount, setWeeklyFastingCount] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(2);

  useEffect(() => {
    loadFastingData();
  }, []);

  const loadFastingData = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('fastingDate');
      const todayFasting = await AsyncStorage.getItem('todayFasting');
      
      // Load weekly goal
      const savedGoal = await AsyncStorage.getItem('weeklyFastingGoal');
      const goal = savedGoal ? parseInt(savedGoal) : 2;
      setWeeklyGoal(goal);
      
      // Check if it's a new week
      const currentWeek = getWeekNumber(new Date());
      const lastWeek = await AsyncStorage.getItem('fastingWeek');
      
      if (lastWeek !== currentWeek.toString()) {
        // New week - reset counter
        await AsyncStorage.setItem('fastingWeek', currentWeek.toString());
        await AsyncStorage.setItem('weeklyFastingCount', '0');
        setWeeklyFastingCount(0);
      } else {
        const count = await AsyncStorage.getItem('weeklyFastingCount');
        if (count) {
          setWeeklyFastingCount(parseInt(count));
        }
      }
      
      if (lastDate !== today) {
        await AsyncStorage.setItem('fastingDate', today);
        await AsyncStorage.setItem('todayFasting', 'false');
        setIsFasting(false);
      } else {
        setIsFasting(todayFasting === 'true');
      }
    } catch (error) {
      console.log('Error loading fasting data:', error);
    }
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const toggleFasting = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newFasting = !isFasting;
    setIsFasting(newFasting);
    
    if (newFasting) {
      const newCount = weeklyFastingCount + 1;
      setWeeklyFastingCount(newCount);
      await AsyncStorage.setItem('weeklyFastingCount', newCount.toString());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // If unchecking, decrease count
      const newCount = Math.max(0, weeklyFastingCount - 1);
      setWeeklyFastingCount(newCount);
      await AsyncStorage.setItem('weeklyFastingCount', newCount.toString());
    }
    
    await AsyncStorage.setItem('todayFasting', newFasting.toString());
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const isRecommendedDay = () => {
    const day = getDayOfWeek();
    return day === 'Monday' || day === 'Thursday';
  };

  const progress = weeklyGoal > 0 ? (weeklyFastingCount / weeklyGoal) * 100 : 0;
  const goalMet = weeklyFastingCount >= weeklyGoal;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionIconContainer}
        >
          <IconSymbol
            ios_icon_name="moon.fill"
            android_material_icon_name="nightlight"
            size={20}
            color={colors.card}
          />
        </LinearGradient>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Fasting Tracker</Text>
          <Text style={styles.sectionSubtitle}>
            {weeklyFastingCount}/{weeklyGoal} days this week
            {goalMet && ' ✓'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(iman)/goals-settings');
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="gear"
            android_material_icon_name="settings"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.fastingCard}
        onPress={toggleFasting}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isFasting ? colors.gradientPurple : [colors.card, colors.cardAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fastingCardGradient}
        >
          <View style={styles.fastingCardContent}>
            <View style={[
              styles.fastingCheckCircle,
              isFasting && styles.fastingCheckCircleActive
            ]}>
              {isFasting && (
                <IconSymbol
                  ios_icon_name="checkmark"
                  android_material_icon_name="check"
                  size={24}
                  color={colors.card}
                />
              )}
            </View>
            <View style={styles.fastingInfo}>
              <Text style={[
                styles.fastingTitle,
                isFasting && styles.fastingTitleActive
              ]}>
                {isFasting ? 'Fasting Today' : 'Not Fasting Today'}
              </Text>
              <Text style={[
                styles.fastingSubtitle,
                isFasting && styles.fastingSubtitleActive
              ]}>
                {getDayOfWeek()}
                {isRecommendedDay() && ' (Recommended)'}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name={isFasting ? "checkmark.circle.fill" : "circle"}
              android_material_icon_name={isFasting ? "check-circle" : "radio-button-unchecked"}
              size={32}
              color={isFasting ? colors.card : colors.border}
            />
          </View>
          
          {isRecommendedDay() && !isFasting && (
            <View style={styles.recommendationBanner}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.recommendationText}>
                Sunnah to fast on {getDayOfWeek()}s
              </Text>
            </View>
          )}

          {goalMet && (
            <View style={styles.goalMetBanner}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.goalMetText}>
                Weekly goal achieved! Masha&apos;Allah! 🎉
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  fastingCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  fastingCardGradient: {
    padding: spacing.lg,
  },
  fastingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fastingCheckCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingCheckCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: colors.card,
  },
  fastingInfo: {
    flex: 1,
  },
  fastingTitle: {
    ...typography.h4,
    color: colors.text,
  },
  fastingTitleActive: {
    color: colors.card,
  },
  fastingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fastingSubtitleActive: {
    color: colors.card,
    opacity: 0.9,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recommendationText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
  goalMetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.success + '30',
  },
  goalMetText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
});
