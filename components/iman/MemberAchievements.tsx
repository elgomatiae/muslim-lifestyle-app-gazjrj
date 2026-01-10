/**
 * Member Achievements Component
 * Compact display of user achievements for community profiles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { LOCAL_ACHIEVEMENTS } from '@/data/localAchievements';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MemberAchievementsProps {
  userId: string;
  limit?: number;
  showTitle?: boolean;
}

export default function MemberAchievements({ userId, limit = 5, showTitle = true }: MemberAchievementsProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAchievements();
  }, [userId]);

  const loadUserAchievements = async () => {
    try {
      setLoading(true);

      let unlockedAchievements: any[] = [];

      // Try Supabase first
      try {
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false })
          .limit(limit);

        if (userAchievements && userAchievements.length > 0) {
          const achievementIds = userAchievements.map(ua => ua.achievement_id);
          const { data: achievementsData } = await supabase
            .from('achievements')
            .select('*')
            .in('id', achievementIds)
            .eq('is_active', true);

          if (achievementsData) {
            unlockedAchievements = achievementsData.slice(0, limit);
          }
        }
      } catch (error) {
        // Fallback to local
        const unlockedData = await AsyncStorage.getItem(`user_achievements_${userId}`);
        if (unlockedData) {
          const userAchievements = JSON.parse(unlockedData);
          const achievementIds = userAchievements.map((ua: any) => ua.achievement_id || ua.id);
          unlockedAchievements = LOCAL_ACHIEVEMENTS
            .filter(a => achievementIds.includes(a.id))
            .slice(0, limit);
        }
      }

      setAchievements(unlockedAchievements);
    } catch (error) {
      console.log('Error loading member achievements:', error);
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
      default: return colors.primary;
    }
  };

  if (loading || achievements.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="trophy.fill"
            android_material_icon_name="emoji-events"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.title}>Achievements ({achievements.length})</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsScroll}
      >
        {achievements.map((achievement, index) => (
          <View
            key={achievement.id || index}
            style={[
              styles.achievementBadge,
              { borderColor: getTierColor(achievement.tier) + '40' },
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                { backgroundColor: getTierColor(achievement.tier) + '20' },
              ]}
            >
              <IconSymbol
                ios_icon_name={achievement.icon_name || 'star.fill'}
                android_material_icon_name="star"
                size={16}
                color={getTierColor(achievement.tier)}
              />
            </View>
            <Text style={styles.achievementTitle} numberOfLines={1}>
              {achievement.title}
            </Text>
            <View
              style={[
                styles.tierDot,
                { backgroundColor: getTierColor(achievement.tier) },
              ]}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  achievementsScroll: {
    gap: spacing.xs,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.xs,
    gap: spacing.xs,
    maxWidth: 140,
  },
  achievementIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
    flex: 1,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
