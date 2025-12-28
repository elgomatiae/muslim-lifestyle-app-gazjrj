
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
  progress: number;
  current_value: number;
}

export default function AchievementsBadges() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
      
      // Set up real-time refresh interval
      const interval = setInterval(() => {
        loadAchievements();
      }, 5000); // Refresh every 5 seconds for instant updates
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      console.log('🏆 Loading achievements for user:', user.id);

      // Load all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (achievementsError) {
        console.log('❌ Error loading achievements:', achievementsError);
        setLoading(false);
        return;
      }

      console.log('✅ Loaded achievements:', allAchievements?.length || 0);

      // Load user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (userError) {
        console.log('⚠️ Error loading user achievements:', userError);
      } else {
        console.log('✅ User unlocked achievements:', userAchievements?.length || 0);
      }

      // Load progress for locked achievements
      const { data: progressData, error: progressError } = await supabase
        .from('achievement_progress')
        .select('achievement_id, current_value')
        .eq('user_id', user.id);

      if (progressError) {
        console.log('⚠️ Error loading progress:', progressError);
      } else {
        console.log('✅ Progress data loaded:', progressData?.length || 0);
      }

      // Merge data
      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const progressMap = new Map(progressData?.map(p => [p.achievement_id, p.current_value]) || []);
      const unlockedAtMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []);

      const mergedAchievements = (allAchievements || []).map((achievement) => {
        const unlocked = unlockedIds.has(achievement.id);
        const currentValue = progressMap.get(achievement.id) || 0;
        const progress = unlocked ? 100 : Math.min(100, (currentValue / achievement.requirement_value) * 100);

        return {
          ...achievement,
          unlocked,
          unlocked_at: unlockedAtMap.get(achievement.id),
          progress,
          current_value: currentValue,
        };
      });

      console.log('✅ Merged achievements:', mergedAchievements.length);
      console.log('📊 Unlocked count:', mergedAchievements.filter(a => a.unlocked).length);
      console.log('📊 Locked count:', mergedAchievements.filter(a => !a.unlocked).length);

      setAchievements(mergedAchievements);

      // Get recent achievements (unlocked in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recent = mergedAchievements
        .filter(a => a.unlocked && a.unlocked_at && new Date(a.unlocked_at) >= sevenDaysAgo)
        .sort((a, b) => {
          if (!a.unlocked_at || !b.unlocked_at) return 0;
          return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
        })
        .slice(0, 5); // Show top 5 recent achievements

      console.log('✅ Recent achievements:', recent.length);
      setRecentAchievements(recent);
    } catch (error) {
      console.log('❌ Error in loadAchievements:', error);
    } finally {
      setLoading(false);
    }
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

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/(iman)/achievements' as any);
  };

  const renderAchievementCard = (achievement: Achievement, index: number) => {
    const tierColor = getTierColor(achievement.tier);
    
    return (
      <React.Fragment key={index}>
        <TouchableOpacity
          style={[
            styles.achievementCard,
            !achievement.unlocked && styles.achievementCardLocked
          ]}
          onPress={handleViewDetails}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={achievement.unlocked 
              ? [tierColor + '80', tierColor + '60']
              : [colors.card, colors.cardAlt]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementCardGradient}
          >
            <View style={[
              styles.achievementIconContainer,
              !achievement.unlocked && styles.achievementIconContainerLocked
            ]}>
              <IconSymbol
                ios_icon_name={achievement.unlocked ? 'star.fill' : 'lock.fill'}
                android_material_icon_name={achievement.unlocked ? 'star' : 'lock'}
                size={32}
                color={achievement.unlocked ? colors.card : colors.textSecondary}
              />
            </View>
            
            <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.tierBadgeText}>{achievement.tier}</Text>
            </View>
            
            <Text style={[
              styles.achievementTitle,
              achievement.unlocked && styles.achievementTitleUnlocked
            ]}>
              {achievement.title}
            </Text>
            
            <Text style={[
              styles.achievementDescription,
              achievement.unlocked && styles.achievementDescriptionUnlocked
            ]} numberOfLines={2}>
              {achievement.description}
            </Text>
            
            {achievement.unlocked ? (
              <View style={styles.unlockedBadge}>
                <IconSymbol
                  ios_icon_name="checkmark.seal.fill"
                  android_material_icon_name="verified"
                  size={16}
                  color={colors.card}
                />
                <Text style={styles.unlockedText}>Unlocked</Text>
              </View>
            ) : (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${achievement.progress}%`,
                        backgroundColor: tierColor
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(achievement.progress)}%
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  if (loading) {
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
              ios_icon_name="rosette"
              android_material_icon_name="workspace-premium"
              size={20}
              color={colors.card}
            />
          </LinearGradient>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionSubtitle}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (achievements.length === 0) {
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
              ios_icon_name="rosette"
              android_material_icon_name="workspace-premium"
              size={20}
              color={colors.card}
            />
          </LinearGradient>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionSubtitle}>No achievements available</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No achievements found. Check back later!</Text>
        </View>
      </View>
    );
  }

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
            ios_icon_name="rosette"
            android_material_icon_name="workspace-premium"
            size={20}
            color={colors.card}
          />
        </LinearGradient>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSubtitle}>{unlockedCount}/{achievements.length} unlocked</Text>
        </View>
      </View>

      {/* Recent Achievements Section */}
      {recentAchievements.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="auto-awesome"
              size={18}
              color={colors.warning}
            />
            <Text style={styles.recentTitle}>Recently Unlocked</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.achievementsScroll}
            contentContainerStyle={styles.achievementsScrollContent}
          >
            {recentAchievements.map((achievement, index) => renderAchievementCard(achievement, index))}
          </ScrollView>
        </View>
      )}

      {/* All Achievements Section */}
      <View style={styles.allAchievementsSection}>
        <View style={styles.allAchievementsHeader}>
          <Text style={styles.allAchievementsTitle}>All Achievements</Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewDetails}
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.achievementsScroll}
          contentContainerStyle={styles.achievementsScrollContent}
        >
          {achievements.map((achievement, index) => renderAchievementCard(achievement, index))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
    width: '100%',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: spacing.xl,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  recentTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  allAchievementsSection: {
    marginTop: spacing.md,
  },
  allAchievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  allAchievementsTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewDetailsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  achievementsScroll: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  achievementsScrollContent: {
    paddingRight: spacing.xl,
  },
  achievementCard: {
    width: 140,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 200,
  },
  achievementIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  achievementIconContainerLocked: {
    backgroundColor: colors.highlight,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  tierBadgeText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 9,
  },
  achievementTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementTitleUnlocked: {
    color: colors.card,
  },
  achievementDescription: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  achievementDescriptionUnlocked: {
    color: colors.card,
    opacity: 0.9,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.sm,
  },
  unlockedText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    ...typography.small,
    color: colors.card,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 10,
  },
});
