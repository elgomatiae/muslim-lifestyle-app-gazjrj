
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  category: 'ibadah' | 'ilm' | 'amanah' | 'general';
  target_value: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  reward_points: number;
  participants_count: number;
  is_active: boolean;
  user_progress?: number;
  user_joined?: boolean;
  user_completed?: boolean;
}

export default function CommunityChallengesScreen() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    try {
      // Load all active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (challengesError) {
        console.log('Error loading challenges:', challengesError);
        return;
      }

      if (!user) {
        setChallenges(challengesData || []);
        return;
      }

      // Load user's challenge progress
      const { data: userChallengesData, error: userError } = await supabase
        .from('user_community_challenges')
        .select('*')
        .eq('user_id', user.id);

      if (userError) {
        console.log('Error loading user challenges:', userError);
      }

      // Merge data
      const mergedChallenges = challengesData?.map(challenge => {
        const userChallenge = userChallengesData?.find(uc => uc.challenge_id === challenge.id);
        return {
          ...challenge,
          user_progress: userChallenge?.current_progress || 0,
          user_joined: !!userChallenge,
          user_completed: userChallenge?.completed || false,
        };
      }) || [];

      setChallenges(mergedChallenges);
    } catch (error) {
      console.log('Error in loadChallenges:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to join challenges.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { error } = await supabase
        .from('user_community_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: 0,
          completed: false,
        });

      if (error) {
        console.log('Error joining challenge:', error);
        Alert.alert('Error', 'Failed to join challenge. Please try again.');
        return;
      }

      // Update participants count
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        await supabase
          .from('community_challenges')
          .update({ participants_count: challenge.participants_count + 1 })
          .eq('id', challengeId);
      }

      Alert.alert('Success', 'You have joined the challenge!');
      await loadChallenges();
    } catch (error) {
      console.log('Error in joinChallenge:', error);
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ibadah': return { ios: 'hands.sparkles.fill', android: 'auto-awesome' };
      case 'ilm': return { ios: 'book.fill', android: 'menu-book' };
      case 'amanah': return { ios: 'heart.fill', android: 'favorite' };
      default: return { ios: 'star.fill', android: 'star' };
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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
        <Text style={styles.headerTitle}>Community Challenges</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Info Banner */}
        <LinearGradient
          colors={colors.gradientInfo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoBanner}
        >
          <IconSymbol
            ios_icon_name="person.3.fill"
            android_material_icon_name="groups"
            size={32}
            color={colors.card}
          />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Join the Community</Text>
            <Text style={styles.infoBannerText}>
              Complete challenges with Muslims worldwide and earn rewards!
            </Text>
          </View>
        </LinearGradient>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {challenges.map((challenge, index) => {
            const categoryColor = getCategoryColor(challenge.category);
            const categoryIcon = getCategoryIcon(challenge.category);
            const daysRemaining = getDaysRemaining(challenge.end_date);
            const progress = challenge.user_progress ? (challenge.user_progress / challenge.target_value) * 100 : 0;

            return (
              <React.Fragment key={index}>
                <View style={styles.challengeCard}>
                  <LinearGradient
                    colors={[categoryColor + '20', categoryColor + '10']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.challengeGradient}
                  >
                    <View style={styles.challengeHeader}>
                      <View style={[styles.challengeIcon, { backgroundColor: categoryColor }]}>
                        <IconSymbol
                          ios_icon_name={categoryIcon.ios}
                          android_material_icon_name={categoryIcon.android}
                          size={24}
                          color={colors.card}
                        />
                      </View>

                      <View style={styles.challengeHeaderInfo}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <View style={styles.challengeMeta}>
                          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                            <Text style={styles.categoryBadgeText}>{challenge.category}</Text>
                          </View>
                          <View style={styles.participantsBadge}>
                            <IconSymbol
                              ios_icon_name="person.2.fill"
                              android_material_icon_name="group"
                              size={12}
                              color={colors.textSecondary}
                            />
                            <Text style={styles.participantsText}>{challenge.participants_count}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.challengeDescription}>{challenge.description}</Text>

                    <View style={styles.challengeDetails}>
                      <View style={styles.challengeDetail}>
                        <IconSymbol
                          ios_icon_name="target"
                          android_material_icon_name="flag"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.challengeDetailText}>
                          Goal: {challenge.target_value} {challenge.challenge_type}
                        </Text>
                      </View>

                      <View style={styles.challengeDetail}>
                        <IconSymbol
                          ios_icon_name="clock.fill"
                          android_material_icon_name="schedule"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.challengeDetailText}>
                          {daysRemaining} days left
                        </Text>
                      </View>

                      <View style={styles.challengeDetail}>
                        <IconSymbol
                          ios_icon_name="star.fill"
                          android_material_icon_name="star"
                          size={16}
                          color={colors.warning}
                        />
                        <Text style={styles.challengeDetailText}>
                          {challenge.reward_points} points
                        </Text>
                      </View>
                    </View>

                    {challenge.user_joined && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Your Progress</Text>
                          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: categoryColor }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {challenge.user_progress}/{challenge.target_value} completed
                        </Text>
                      </View>
                    )}

                    {challenge.user_completed ? (
                      <View style={styles.completedBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={20}
                          color={colors.success}
                        />
                        <Text style={styles.completedText}>Completed!</Text>
                      </View>
                    ) : challenge.user_joined ? (
                      <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          // Navigate to relevant tracking screen
                        }}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[categoryColor, categoryColor + 'CC']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.buttonGradient}
                        >
                          <Text style={styles.buttonText}>Continue Challenge</Text>
                          <IconSymbol
                            ios_icon_name="arrow.right"
                            android_material_icon_name="arrow-forward"
                            size={16}
                            color={colors.card}
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => joinChallenge(challenge.id)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[categoryColor, categoryColor + 'CC']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.buttonGradient}
                        >
                          <IconSymbol
                            ios_icon_name="plus.circle.fill"
                            android_material_icon_name="add-circle"
                            size={20}
                            color={colors.card}
                          />
                          <Text style={styles.buttonText}>Join Challenge</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </LinearGradient>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {challenges.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="person.3"
              android_material_icon_name="groups"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No active challenges</Text>
            <Text style={styles.emptyStateSubtext}>Check back soon for new community challenges!</Text>
          </View>
        )}

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
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    ...typography.h4,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  infoBannerText: {
    ...typography.body,
    color: colors.card,
    opacity: 0.95,
  },
  challengesList: {
    gap: spacing.lg,
  },
  challengeCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  challengeGradient: {
    padding: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeHeaderInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: 10,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
  },
  participantsText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 10,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  challengeDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  challengeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  challengeDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    height: 8,
    backgroundColor: colors.highlight,
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
  },
  completedText: {
    ...typography.bodyBold,
    color: colors.success,
  },
  joinButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  continueButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
