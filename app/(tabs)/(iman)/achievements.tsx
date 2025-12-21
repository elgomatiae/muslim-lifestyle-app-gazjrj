
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
}

export default function AchievementsScreen() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      // Load all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (achievementsError) {
        console.log('Error loading achievements:', achievementsError);
        return;
      }

      // Load user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (userError) {
        console.log('Error loading user achievements:', userError);
      }

      // Merge data
      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const mergedAchievements = allAchievements?.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlocked_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at,
        category: getCategoryFromType(achievement.requirement_type),
        tier: getTierFromPoints(achievement.points),
      })) || [];

      setAchievements(mergedAchievements);
    } catch (error) {
      console.log('Error in loadAchievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromType = (type: string): string => {
    if (type.includes('prayer') || type.includes('salah')) return 'ibadah';
    if (type.includes('quran')) return 'ibadah';
    if (type.includes('dhikr')) return 'ibadah';
    if (type.includes('lecture') || type.includes('learning')) return 'ilm';
    if (type.includes('exercise') || type.includes('sleep')) return 'amanah';
    return 'general';
  };

  const getTierFromPoints = (points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (points >= 500) return 'platinum';
    if (points >= 250) return 'gold';
    if (points >= 100) return 'silver';
    return 'bronze';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return '#A78BFA';
      case 'gold': return '#FBBF24';
      case 'silver': return '#9CA3AF';
      case 'bronze': return '#CD7F32';
      default: return colors.textSecondary;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ibadah': return '#10B981';
      case 'ilm': return '#3B82F6';
      case 'amanah': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji-events"
                size={32}
                color={colors.card}
              />
              <Text style={styles.statValue}>{unlockedCount}/{achievements.length}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color={colors.card}
              />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter('all');
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'unlocked' && styles.filterTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter('unlocked');
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'unlocked' && styles.filterTabTextActive]}>
              Unlocked
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'locked' && styles.filterTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter('locked');
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'locked' && styles.filterTabTextActive]}>
              Locked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement, index) => {
            const tierColor = getTierColor(achievement.tier);
            const categoryColor = getCategoryColor(achievement.category);

            return (
              <React.Fragment key={index}>
                <View style={[
                  styles.achievementCard,
                  achievement.unlocked && styles.achievementCardUnlocked,
                ]}>
                  <LinearGradient
                    colors={achievement.unlocked ? [tierColor + '40', tierColor + '20'] : [colors.card, colors.card]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.achievementGradient}
                  >
                    <View style={[
                      styles.achievementIcon,
                      { backgroundColor: achievement.unlocked ? tierColor : colors.border },
                    ]}>
                      <IconSymbol
                        ios_icon_name={achievement.unlocked ? 'star.fill' : 'lock.fill'}
                        android_material_icon_name={achievement.unlocked ? 'star' : 'lock'}
                        size={32}
                        color={achievement.unlocked ? colors.card : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.achievementContent}>
                      <View style={styles.achievementHeader}>
                        <Text style={[
                          styles.achievementTitle,
                          !achievement.unlocked && styles.achievementTitleLocked,
                        ]}>
                          {achievement.title}
                        </Text>
                        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
                          <Text style={styles.tierBadgeText}>{achievement.tier}</Text>
                        </View>
                      </View>

                      <Text style={[
                        styles.achievementDescription,
                        !achievement.unlocked && styles.achievementDescriptionLocked,
                      ]}>
                        {achievement.description}
                      </Text>

                      <View style={styles.achievementFooter}>
                        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                          <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                            {achievement.category}
                          </Text>
                        </View>

                        <View style={styles.pointsBadge}>
                          <IconSymbol
                            ios_icon_name="star.fill"
                            android_material_icon_name="star"
                            size={14}
                            color={colors.warning}
                          />
                          <Text style={styles.pointsText}>{achievement.points} pts</Text>
                        </View>
                      </View>

                      {achievement.unlocked && achievement.unlocked_at && (
                        <Text style={styles.unlockedDate}>
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              </React.Fragment>
            );
          })}
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
  statsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.card,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.card,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  filterTabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  achievementsList: {
    gap: spacing.md,
  },
  achievementCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.medium,
  },
  achievementCardUnlocked: {
    borderColor: 'transparent',
  },
  achievementGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tierBadgeText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  achievementDescription: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  achievementDescriptionLocked: {
    color: colors.textSecondary,
  },
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    ...typography.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  unlockedDate: {
    ...typography.small,
    color: colors.success,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 100,
  },
});
