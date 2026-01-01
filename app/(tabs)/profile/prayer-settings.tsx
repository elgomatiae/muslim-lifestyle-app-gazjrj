
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  getCalculationMethod,
  saveCalculationMethod,
  CALCULATION_METHODS,
  getPrayerTimeAdjustments,
  savePrayerTimeAdjustments,
  PrayerTimeAdjustments,
  refreshPrayerTimes,
} from '@/utils/prayerTimeService';
import { getCachedPrayerTimesData } from '@/utils/prayerTimeService';

export default function PrayerSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState('NorthAmerica');
  const [adjustments, setAdjustments] = useState<PrayerTimeAdjustments>({
    fajr_offset: 0,
    dhuhr_offset: 0,
    asr_offset: 0,
    maghrib_offset: 0,
    isha_offset: 0,
  });
  const [locationInfo, setLocationInfo] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load calculation method
      const method = await getCalculationMethod();
      setCalculationMethod(method);

      // Load adjustments
      const savedAdjustments = await getPrayerTimeAdjustments();
      if (savedAdjustments) {
        setAdjustments(savedAdjustments);
      }

      // Load location info
      const cachedData = await getCachedPrayerTimesData();
      if (cachedData) {
        setLocationInfo(
          cachedData.locationName || 
          `${cachedData.location.latitude.toFixed(4)}, ${cachedData.location.longitude.toFixed(4)}`
        );
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = async (method: string) => {
    try {
      setSaving(true);
      setCalculationMethod(method);
      await saveCalculationMethod(method);
      
      // Refresh prayer times with new method
      await refreshPrayerTimes();
      
      Alert.alert(
        'Success',
        'Calculation method updated. Prayer times have been recalculated.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error changing calculation method:', error);
      Alert.alert('Error', 'Failed to update calculation method');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustmentChange = (prayer: keyof PrayerTimeAdjustments, delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      [prayer]: prev[prayer] + delta,
    }));
  };

  const handleSaveAdjustments = async () => {
    try {
      setSaving(true);
      await savePrayerTimeAdjustments(adjustments);
      
      // Refresh prayer times with new adjustments
      await refreshPrayerTimes();
      
      Alert.alert(
        'Success',
        'Prayer time adjustments saved successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving adjustments:', error);
      Alert.alert('Error', 'Failed to save adjustments');
    } finally {
      setSaving(false);
    }
  };

  const handleResetAdjustments = () => {
    Alert.alert(
      'Reset Adjustments',
      'Are you sure you want to reset all prayer time adjustments to 0?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const resetAdjustments: PrayerTimeAdjustments = {
              fajr_offset: 0,
              dhuhr_offset: 0,
              asr_offset: 0,
              maghrib_offset: 0,
              isha_offset: 0,
            };
            setAdjustments(resetAdjustments);
            await savePrayerTimeAdjustments(resetAdjustments);
            await refreshPrayerTimes();
            Alert.alert('Success', 'Adjustments reset successfully');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Time Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Time Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Info */}
        {locationInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Current Location</Text>
              <Text style={styles.infoValue}>{locationInfo}</Text>
            </View>
          </View>
        )}

        {/* Calculation Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculation Method</Text>
          <Text style={styles.sectionDescription}>
            Choose the calculation method that best matches your local mosque or Islamic center.
            For Aurora (US/Canada), ISNA (North America) is recommended.
          </Text>

          <View style={styles.methodList}>
            {Object.entries(CALCULATION_METHODS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.methodItem,
                  calculationMethod === key && styles.methodItemSelected,
                ]}
                onPress={() => handleMethodChange(key)}
                disabled={saving}
              >
                <View style={styles.methodContent}>
                  <Text
                    style={[
                      styles.methodLabel,
                      calculationMethod === key && styles.methodLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  {key === 'NorthAmerica' && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </View>
                {calculationMethod === key && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Manual Adjustments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Adjustments</Text>
          <Text style={styles.sectionDescription}>
            Fine-tune prayer times by adding or subtracting minutes. Use this if your local mosque
            times differ slightly from the calculated times.
          </Text>

          <View style={styles.adjustmentList}>
            {[
              { key: 'fajr_offset', label: 'Fajr', arabic: 'الفجر' },
              { key: 'dhuhr_offset', label: 'Dhuhr', arabic: 'الظهر' },
              { key: 'asr_offset', label: 'Asr', arabic: 'العصر' },
              { key: 'maghrib_offset', label: 'Maghrib', arabic: 'المغرب' },
              { key: 'isha_offset', label: 'Isha', arabic: 'العشاء' },
            ].map(({ key, label, arabic }) => (
              <View key={key} style={styles.adjustmentItem}>
                <View style={styles.adjustmentInfo}>
                  <Text style={styles.adjustmentLabel}>{label}</Text>
                  <Text style={styles.adjustmentArabic}>{arabic}</Text>
                </View>
                <View style={styles.adjustmentControls}>
                  <TouchableOpacity
                    style={styles.adjustmentButton}
                    onPress={() => handleAdjustmentChange(key as keyof PrayerTimeAdjustments, -1)}
                  >
                    <IconSymbol
                      ios_icon_name="minus"
                      android_material_icon_name="remove"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <View style={styles.adjustmentValue}>
                    <Text style={styles.adjustmentValueText}>
                      {adjustments[key as keyof PrayerTimeAdjustments] > 0 ? '+' : ''}
                      {adjustments[key as keyof PrayerTimeAdjustments]} min
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.adjustmentButton}
                    onPress={() => handleAdjustmentChange(key as keyof PrayerTimeAdjustments, 1)}
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleResetAdjustments}
              disabled={saving}
            >
              <Text style={styles.buttonSecondaryText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSaveAdjustments}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Text style={styles.buttonPrimaryText}>Save Adjustments</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <View style={styles.helpIconContainer}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.accent}
            />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If prayer times are still inaccurate, try:
            </Text>
            <Text style={styles.helpBullet}>• Checking your location permissions</Text>
            <Text style={styles.helpBullet}>• Comparing with your local mosque times</Text>
            <Text style={styles.helpBullet}>• Using manual adjustments to match exactly</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  methodList: {
    gap: spacing.sm,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  methodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodLabel: {
    ...typography.body,
    color: colors.text,
  },
  methodLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  recommendedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recommendedText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  adjustmentList: {
    gap: spacing.sm,
  },
  adjustmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adjustmentInfo: {
    flex: 1,
  },
  adjustmentLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  adjustmentArabic: {
    ...typography.small,
    color: colors.textSecondary,
  },
  adjustmentControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adjustmentButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustmentValue: {
    minWidth: 60,
    alignItems: 'center',
  },
  adjustmentValueText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  buttonPrimaryText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  buttonSecondaryText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  helpIconContainer: {
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  helpBullet: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
