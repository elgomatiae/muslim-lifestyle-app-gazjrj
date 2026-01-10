
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import VideoCard from './VideoCard';
import { Video, VideoCategory } from '@/lib/supabase';

interface CategoryRowProps {
  category: VideoCategory;
  videos: Video[];
  onVideoPress: (video: Video) => void;
  onSeeAllPress: () => void;
}

export default function CategoryRow({ category, videos, onVideoPress, onSeeAllPress }: CategoryRowProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{category.name}</Text>
          {category.description && (
            <Text style={styles.description} numberOfLines={1}>
              {category.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
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
        contentContainerStyle={styles.scrollContent}
      >
        {videos.map((video, index) => (
          <React.Fragment key={index}>
            <VideoCard
              video={video}
              onPress={() => onVideoPress(video)}
            />
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
  },
  seeAllText: {
    ...typography.captionBold,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  scrollContent: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
  },
});
