
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/app/integrations/supabase/client';
import { router } from 'expo-router';

interface MigrationResult {
  title: string;
  category?: string;
  success: boolean;
  error?: string;
}

interface MigrationResponse {
  success: boolean;
  processed: number;
  successCount: number;
  errorCount: number;
  nextStartIndex: number;
  totalProcessed: number;
  results: MigrationResult[];
  message?: string;
}

export default function MigrateRecitationsScreen() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState<MigrationResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const startMigration = async () => {
    Alert.alert(
      'Migrate Quran Recitations',
      'This will migrate all videos from the quran_recitations table to the videos table with proper categorization. This may take several minutes. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Migration',
          onPress: () => performMigration(),
        },
      ]
    );
  };

  const performMigration = async () => {
    setIsMigrating(true);
    setProgress(0);
    setTotalProcessed(0);
    setSuccessCount(0);
    setErrorCount(0);
    setCurrentBatch([]);
    setIsComplete(false);

    let startIndex = 0;
    const batchSize = 10;
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalRecords = 0;

    try {
      // Get total count of recitations
      const { count, error: countError } = await supabase
        .from('quran_recitations')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to get count: ${countError.message}`);
      }

      const totalRecitations = count || 0;
      console.log(`Total recitations to migrate: ${totalRecitations}`);

      // Process in batches
      while (true) {
        try {
          console.log(`Processing batch starting at index ${startIndex}`);

          const { data, error } = await supabase.functions.invoke('migrate-quran-recitations', {
            body: { batchSize, startIndex },
          });

          if (error) {
            throw new Error(`Edge function error: ${error.message}`);
          }

          const response = data as MigrationResponse;

          if (!response.success) {
            throw new Error('Migration batch failed');
          }

          // Update progress
          totalSuccess += response.successCount;
          totalErrors += response.errorCount;
          totalRecords += response.processed;

          setSuccessCount(totalSuccess);
          setErrorCount(totalErrors);
          setTotalProcessed(totalRecords);
          setCurrentBatch(response.results);

          if (totalRecitations > 0) {
            setProgress((totalRecords / totalRecitations) * 100);
          }

          // Check if we're done
          if (response.processed === 0 || response.message === 'No more recitations to process') {
            console.log('Migration complete!');
            setIsComplete(true);
            Alert.alert(
              'Migration Complete',
              `Successfully migrated ${totalSuccess} recitations.\n${totalErrors > 0 ? `${totalErrors} errors occurred.` : ''}`,
              [{ text: 'OK' }]
            );
            break;
          }

          // Move to next batch
          startIndex = response.nextStartIndex;

          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (batchError) {
          console.error('Error processing batch:', batchError);
          Alert.alert(
            'Batch Error',
            `Error at index ${startIndex}: ${batchError.message}\n\nContinue with next batch?`,
            [
              { text: 'Stop', style: 'cancel', onPress: () => setIsMigrating(false) },
              {
                text: 'Continue',
                onPress: () => {
                  startIndex += batchSize;
                },
              },
            ]
          );
          break;
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
      Alert.alert('Migration Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Migrate Recitations</Text>
          <Text style={styles.headerSubtitle}>Import from quran_recitations table</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <View style={styles.infoIconContainer}>
            <IconSymbol
              ios_icon_name="music.note"
              android_material_icon_name="headset"
              size={40}
              color={colors.card}
            />
          </View>
          <Text style={styles.infoTitle}>Quran Recitation Migration</Text>
          <Text style={styles.infoDescription}>
            This tool will migrate all videos from the quran_recitations table to the videos table with intelligent categorization using AI.
          </Text>
          <View style={styles.infoStats}>
            <View style={styles.infoStat}>
              <Text style={styles.infoStatValue}>309</Text>
              <Text style={styles.infoStatLabel}>Total Videos</Text>
            </View>
            <View style={styles.infoStat}>
              <Text style={styles.infoStatValue}>8</Text>
              <Text style={styles.infoStatLabel}>Categories</Text>
            </View>
          </View>
        </LinearGradient>

        {!isMigrating && !isComplete && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startMigration}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradientAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <IconSymbol
                ios_icon_name="play.circle.fill"
                android_material_icon_name="play-circle"
                size={24}
                color={colors.card}
              />
              <Text style={styles.startButtonText}>Start Migration</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isMigrating && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Migration in Progress</Text>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalProcessed}</Text>
                <Text style={styles.statLabel}>Processed</Text>
              </View>
              <View style={[styles.statCard, styles.statCardSuccess]}>
                <Text style={[styles.statValue, styles.statValueSuccess]}>{successCount}</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
              <View style={[styles.statCard, styles.statCardError]}>
                <Text style={[styles.statValue, styles.statValueError]}>{errorCount}</Text>
                <Text style={styles.statLabel}>Errors</Text>
              </View>
            </View>

            {currentBatch.length > 0 && (
              <View style={styles.currentBatchContainer}>
                <Text style={styles.currentBatchTitle}>Current Batch:</Text>
                <ScrollView style={styles.currentBatchList} nestedScrollEnabled>
                  {currentBatch.map((result, index) => (
                    <View
                      key={index}
                      style={[
                        styles.batchItem,
                        result.success ? styles.batchItemSuccess : styles.batchItemError,
                      ]}
                    >
                      <IconSymbol
                        ios_icon_name={result.success ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                        android_material_icon_name={result.success ? 'check-circle' : 'cancel'}
                        size={20}
                        color={result.success ? colors.success : colors.error}
                      />
                      <View style={styles.batchItemContent}>
                        <Text style={styles.batchItemTitle} numberOfLines={1}>
                          {result.title}
                        </Text>
                        {result.success && result.category && (
                          <Text style={styles.batchItemCategory}>{result.category}</Text>
                        )}
                        {!result.success && result.error && (
                          <Text style={styles.batchItemError}>{result.error}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {isComplete && (
          <View style={styles.completeCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completeIconContainer}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={64}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.completeTitle}>Migration Complete!</Text>
            <Text style={styles.completeDescription}>
              Successfully migrated {successCount} Quran recitations to the videos table.
              {errorCount > 0 && ` ${errorCount} errors occurred during migration.`}
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.categoriesCard}>
          <Text style={styles.categoriesTitle}>Available Categories</Text>
          <Text style={styles.categoriesDescription}>
            Recitations will be automatically categorized into:
          </Text>
          <View style={styles.categoriesList}>
            {[
              'Full Quran',
              'Juz Recitations',
              'Surah Recitations',
              'Tilawah',
              'Tajweed Lessons',
              'Memorization',
              'Taraweeh',
              'Special Occasions',
            ].map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.categoryItemText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 56 : 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.small,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  infoCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.colored,
  },
  infoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.card,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  infoDescription: {
    ...typography.body,
    color: colors.card,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  infoStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  infoStat: {
    alignItems: 'center',
  },
  infoStatValue: {
    ...typography.h1,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  infoStatLabel: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  startButtonText: {
    ...typography.h4,
    color: colors.card,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text,
  },
  progressBarContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statCardSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statCardError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statValueSuccess: {
    color: colors.success,
  },
  statValueError: {
    color: colors.error,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  currentBatchContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  currentBatchTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  currentBatchList: {
    maxHeight: 200,
  },
  batchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  batchItemSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  batchItemError: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  batchItemContent: {
    flex: 1,
  },
  batchItemTitle: {
    ...typography.caption,
    color: colors.text,
  },
  batchItemCategory: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  batchItemError: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
  completeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  completeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  completeTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  completeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    ...shadows.medium,
  },
  doneButtonText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  categoriesCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.small,
  },
  categoriesTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoriesDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  categoriesList: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryItemText: {
    ...typography.body,
    color: colors.text,
  },
});
