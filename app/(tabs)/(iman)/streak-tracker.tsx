
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days_active: number;
  last_active_date: string;
  streak_milestones: number[];
}

export default function StreakTrackerScreen() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading streak data:', error);
      }

      if (data) {
        setStreakData(data);
      } else {
        // Initialize streak data
        const { data: newData, error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            total_days_active: 0,
            last_active_date: new Date().toISOString(),
            streak_milestones: [],
          })
          .select()
          .single();

        if (!insertError && newData) {
          setStreakData(newData);
        }
      }
    } catch (error) {
      console.log('Error in loadStreakData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakTier = (streak: number) => {
    if (streak >= 365) return { name: 'Diamond', color: '#60A5FA', icon: 'diamond.fill' };
    if (streak >= 180) return { name: 'Platinum', color: '#A78BFA', icon: 'star.fill' };
    if (streak >= 90) return { name: 'Gold', color: '#FBBF24', icon: 'crown.fill' };
    if (streak >= 30) return { name: 'Silver', color: '#9CA3AF', icon: 'shield.fill' };
    if (streak >= 7) return { name: 'Bronze', color: '#CD7F32', icon: 'medal.fill' };
    return { name: 'Beginner', color: colors.textSecondary, icon: 'leaf.fill' };
  };

  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const tier = getStreakTier(currentStreak);

  const nextMilestone = milestones.find(m => m > currentStreak) || 365;
  const progress = (currentStreak / nextMilestone) * 100;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Streak Card */}
        <LinearGradient
          colors={[tier.color + '40', tier.color + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <View style={styles.streakHeader}>
            <IconSymbol
              ios_icon_name={tier.icon}
              android_material_icon_name="emoji-events"
              size={48}
              color={tier.color}
            />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTier}>{tier.name} Tier</Text>
              <Text style={styles.streakDays}>{currentStreak} Days</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
          </View>

          {currentStreak > 0 && (
            <View style={styles.streakProgress}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Next Milestone: {nextMilestone} days</Text>
                <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tier.color }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="local-fire-department"
              size={32}
              color={colors.warning}
            />
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              ios_icon_name="calendar.badge.checkmark"
              android_material_icon_name="event-available"
              size={32}
              color={colors.success}
            />
            <Text style={styles.statValue}>{streakData?.total_days_active || 0}</Text>
            <Text style={styles.statLabel}>Total Days Active</Text>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.milestonesGrid}>
            {milestones.map((milestone, index) => {
              const achieved = currentStreak >= milestone;
              const isNext = milestone === nextMilestone;

              return (
                <React.Fragment key={index}>
                  <View style={[
                    styles.milestoneCard,
                    achieved && styles.milestoneCardAchieved,
                    isNext && styles.milestoneCardNext,
                  ]}>
                    <IconSymbol
                      ios_icon_name={achieved ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={achieved ? 'check-circle' : 'radio-button-unchecked'}
                      size={24}
                      color={achieved ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.milestoneText,
                      achieved && styles.milestoneTextAchieved,
                    ]}>
                      {milestone} Days
                    </Text>
                    {isNext && !achieved && (
                      <View style={styles.nextBadge}>
                        <Text style={styles.nextBadgeText}>Next</Text>
                      </View>
                    )}
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Maintain Your Streak</Text>
          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="lightbulb"
              size={24}
              color={colors.warning}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Daily Consistency</Text>
              <Text style={styles.tipText}>
                Complete at least one goal from each ring (ʿIbādah, ʿIlm, Amanah) daily to maintain your streak.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={24}
              color={colors.info}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Set Reminders</Text>
              <Text style={styles.tipText}>
                Enable notifications to remind you to complete your daily goals before midnight.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={24}
              color={colors.accent}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Streak Freeze</Text>
              <Text style={styles.tipText}>
                Earn streak freezes by maintaining 7-day streaks. Use them to protect your streak on busy days.
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  streakCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  streakInfo: {
    flex: 1,
  },
  streakTier: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  streakDays: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '800',
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  streakProgress: {
    gap: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  progressPercent: {
    ...typography.bodyBold,
    color: colors.text,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  milestonesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  milestoneCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  milestoneCardAchieved: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  milestoneCardNext: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  milestoneText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  milestoneTextAchieved: {
    color: colors.success,
  },
  nextBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  nextBadgeText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '700',
    fontSize: 10,
  },
  tipsSection: {
    marginBottom: spacing.lg,
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});
