
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  overall_score: number;
  ibadah_score: number;
  ilm_score: number;
  amanah_score: number;
  total_points: number;
  current_streak: number;
  rank: number;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'all-time';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [period, setPeriod] = useState<PeriodType>('all-time');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(100);

      if (error) {
        console.log('Error loading leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);

      // Find user's entry
      if (user) {
        const userEntryData = data?.find(entry => entry.user_id === user.id);
        setUserEntry(userEntryData || null);
      }
    } catch (error) {
      console.log('Error in loadLeaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.textSecondary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'crown.fill';
    if (rank === 2) return 'medal.fill';
    if (rank === 3) return 'medal.fill';
    return 'number';
  };

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
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
          {(['daily', 'weekly', 'monthly', 'all-time'] as PeriodType[]).map((p, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPeriod(p);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* User's Rank Card */}
        {userEntry && (
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userRankCard}
          >
            <View style={styles.userRankHeader}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account-circle"
                size={48}
                color={colors.card}
              />
              <View style={styles.userRankInfo}>
                <Text style={styles.userRankName}>Your Rank</Text>
                <Text style={styles.userRankPosition}>#{userEntry.rank}</Text>
              </View>
              <View style={styles.userRankScore}>
                <Text style={styles.userRankScoreValue}>{userEntry.overall_score}</Text>
                <Text style={styles.userRankScoreLabel}>Score</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumRank, { backgroundColor: '#C0C0C0' }]}>
                <IconSymbol
                  ios_icon_name="medal.fill"
                  android_material_icon_name="emoji-events"
                  size={24}
                  color={colors.card}
                />
              </View>
              <View style={[styles.podiumBar, { height: 80, backgroundColor: '#C0C0C0' + '40' }]}>
                <Text style={styles.podiumUsername}>{leaderboard[1].username || 'User'}</Text>
                <Text style={styles.podiumScore}>{leaderboard[1].overall_score}</Text>
              </View>
              <Text style={styles.podiumLabel}>2nd</Text>
            </View>

            {/* 1st Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumRank, { backgroundColor: '#FFD700' }]}>
                <IconSymbol
                  ios_icon_name="crown.fill"
                  android_material_icon_name="emoji-events"
                  size={32}
                  color={colors.card}
                />
              </View>
              <View style={[styles.podiumBar, { height: 120, backgroundColor: '#FFD700' + '40' }]}>
                <Text style={styles.podiumUsername}>{leaderboard[0].username || 'User'}</Text>
                <Text style={styles.podiumScore}>{leaderboard[0].overall_score}</Text>
              </View>
              <Text style={styles.podiumLabel}>1st</Text>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumRank, { backgroundColor: '#CD7F32' }]}>
                <IconSymbol
                  ios_icon_name="medal.fill"
                  android_material_icon_name="emoji-events"
                  size={24}
                  color={colors.card}
                />
              </View>
              <View style={[styles.podiumBar, { height: 60, backgroundColor: '#CD7F32' + '40' }]}>
                <Text style={styles.podiumUsername}>{leaderboard[2].username || 'User'}</Text>
                <Text style={styles.podiumScore}>{leaderboard[2].overall_score}</Text>
              </View>
              <Text style={styles.podiumLabel}>3rd</Text>
            </View>
          </View>
        )}

        {/* Full Leaderboard */}
        <View style={styles.leaderboardList}>
          <Text style={styles.listTitle}>All Rankings</Text>
          {leaderboard.map((entry, index) => {
            const isUser = user && entry.user_id === user.id;
            const rankColor = getRankColor(entry.rank);

            return (
              <React.Fragment key={index}>
                <View style={[styles.leaderboardEntry, isUser && styles.leaderboardEntryUser]}>
                  <View style={styles.entryRank}>
                    <Text style={[styles.entryRankText, { color: rankColor }]}>
                      #{entry.rank}
                    </Text>
                  </View>

                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryUsername, isUser && styles.entryUsernameUser]}>
                      {entry.username || 'Anonymous User'}
                      {isUser && ' (You)'}
                    </Text>
                    <View style={styles.entryStats}>
                      <View style={styles.entryStat}>
                        <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.entryStatText}>{entry.ibadah_score}</Text>
                      </View>
                      <View style={styles.entryStat}>
                        <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.entryStatText}>{entry.ilm_score}</Text>
                      </View>
                      <View style={styles.entryStat}>
                        <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.entryStatText}>{entry.amanah_score}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.entryScore}>
                    <Text style={styles.entryScoreValue}>{entry.overall_score}</Text>
                    <Text style={styles.entryScoreLabel}>Score</Text>
                  </View>
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
  periodSelector: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  periodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  periodButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  userRankCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  userRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userRankInfo: {
    flex: 1,
  },
  userRankName: {
    ...typography.body,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  userRankPosition: {
    ...typography.h2,
    color: colors.card,
    fontWeight: '800',
  },
  userRankScore: {
    alignItems: 'center',
  },
  userRankScoreValue: {
    ...typography.h3,
    color: colors.card,
    fontWeight: '700',
  },
  userRankScoreLabel: {
    ...typography.small,
    color: colors.card,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  podiumPlace: {
    flex: 1,
    alignItems: 'center',
  },
  podiumRank: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumUsername: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  podiumScore: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  podiumLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  leaderboardList: {
    marginBottom: spacing.lg,
  },
  listTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  leaderboardEntryUser: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  entryRank: {
    width: 48,
    alignItems: 'center',
  },
  entryRankText: {
    ...typography.h4,
    fontWeight: '700',
  },
  entryInfo: {
    flex: 1,
  },
  entryUsername: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  entryUsernameUser: {
    color: colors.primary,
    fontWeight: '700',
  },
  entryStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  entryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entryStatText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  entryScore: {
    alignItems: 'center',
  },
  entryScoreValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  entryScoreLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 100,
  },
});
