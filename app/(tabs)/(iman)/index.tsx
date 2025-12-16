
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import ImanRingsDisplay from "@/components/iman/ImanRingsDisplay";
import { resetDailyGoals, resetWeeklyGoals, updateSectionScores } from "@/utils/imanScoreCalculator";

export default function ImanTrackerScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const lastDate = await AsyncStorage.getItem('lastImanDate');
      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        // New day - reset daily goals
        await resetDailyGoals();
        await AsyncStorage.setItem('lastImanDate', today);
      }
      
      // Check if it's a new week
      const currentWeek = getWeekNumber(new Date());
      const lastWeek = await AsyncStorage.getItem('lastImanWeek');
      
      if (lastWeek !== currentWeek.toString()) {
        // New week - reset weekly goals
        await resetWeeklyGoals();
        await AsyncStorage.setItem('lastImanWeek', currentWeek.toString());
      }
      
      // Update scores with decay
      await updateSectionScores();
    } catch (error) {
      console.log('Error loading iman data:', error);
    }
  }, []);

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Update scores every minute to apply decay
    const scoreInterval = setInterval(async () => {
      await updateSectionScores();
    }, 60000); // Every minute
    
    return () => clearInterval(scoreInterval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.header}>Iman Tracker</Text>
            <Text style={styles.subtitle}>Track your spiritual journey</Text>
          </View>
        </View>

        <ImanRingsDisplay onRefresh={onRefresh} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconContainer}
            >
              <IconSymbol
                ios_icon_name="target"
                android_material_icon_name="track-changes"
                size={20}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Manage Your Goals</Text>
          </View>
          
          <View style={styles.goalsGrid}>
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/prayer-goals');
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalCardGradient}
              >
                <IconSymbol
                  ios_icon_name="hands.sparkles.fill"
                  android_material_icon_name="auto-awesome"
                  size={32}
                  color={colors.card}
                />
                <Text style={styles.goalCardTitle}>Prayer Goals</Text>
                <Text style={styles.goalCardDescription}>
                  5 Fard + Sunnah + Tahajjud
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/quran-goals');
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalCardGradient}
              >
                <IconSymbol
                  ios_icon_name="book.fill"
                  android_material_icon_name="book"
                  size={32}
                  color={colors.card}
                />
                <Text style={styles.goalCardTitle}>Quran Goals</Text>
                <Text style={styles.goalCardDescription}>
                  Reading + Memorization
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/dhikr-goals');
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={colors.gradientInfo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalCardGradient}
              >
                <IconSymbol
                  ios_icon_name="hand.raised.fill"
                  android_material_icon_name="back-hand"
                  size={32}
                  color={colors.card}
                />
                <Text style={styles.goalCardTitle}>Dhikr Goals</Text>
                <Text style={styles.goalCardDescription}>
                  Daily + Weekly Targets
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How It Works</Text>
              <Text style={styles.infoText}>
                - Each ring represents a section: Prayer, Quran, and Dhikr{'\n'}
                - Set custom goals for each section{'\n'}
                - Rings reach 100% when all daily and weekly goals are met{'\n'}
                - Scores decay if goals aren&apos;t completed{'\n'}
                - Stay consistent to maintain high scores!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
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
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  goalCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  goalCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 140,
    justifyContent: 'center',
  },
  goalCardTitle: {
    ...typography.bodyBold,
    color: colors.card,
    textAlign: 'center',
  },
  goalCardDescription: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
