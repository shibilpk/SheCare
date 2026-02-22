import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { STYLE } from '../../constants/app';
import { useHydration } from './useHydration';
import { useHydrationContent } from './useHydrationContent';
import {
  HydrationLogSkeleton,
  HydrationContentSkeleton,
} from './HydrationSkeleton';
import InfoCard from '../../components/common/InfoCard';
import Fireworks from '../../components/common/Fireworks';

export default function HydrationScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split('T')[0];

  const {
    hydrationLog,
    isLoading,
    isUpdating,
    addWater,
    removeWater,
    updateSettings,
  } = useHydration(today);

  const { content: hydrationContent, isLoading: isContentLoading } =
    useHydrationContent();

  const [glassSize, setGlassSize] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  // Update local state when hydration log is loaded
  useEffect(() => {
    if (hydrationLog) {
      setGlassSize(String(hydrationLog.glass_size_ml));
      setDailyGoal(String(hydrationLog.daily_goal_ml));
    }
  }, [hydrationLog]);

  // Trigger fireworks when goal is achieved
  useEffect(() => {
    if (hydrationLog) {
      const currentProgress = hydrationLog.progress_percent || 0;

      // Check if just achieved goal (crossed 100% threshold)


      if (currentProgress >= 100) {
        setShowFireworks(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrationLog?.progress_percent]);

  const handleAddGlass = async () => {
    if (!hydrationLog) return;
    try {
      await addWater(hydrationLog.glass_size_ml);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to add water',
      );
    }
  };

  const handleRemoveGlass = async () => {
    if (!hydrationLog) return;
    try {
      await removeWater(hydrationLog.glass_size_ml);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to remove water',
      );
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(Number(glassSize) || 250, Number(dailyGoal) || 2000);
      setWaterModalVisible(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to save settings',
      );
    }
  };

  const totalGlasses = hydrationLog?.glasses_count || 0;
  const totalLiters = hydrationLog?.total_liters || 0;
  const progressPercent = hydrationLog?.progress_percent || 0;
  const goalInLiters = (hydrationLog?.daily_goal_ml || 2000) / 1000;
  const glassGoal = Math.ceil(
    goalInLiters / ((hydrationLog?.glass_size_ml || 250) / 1000),
  );
  const remainingGlasses = Math.max(0, glassGoal - totalGlasses).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hydration Tracker</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setWaterModalVisible(true)}
        >
          <FontelloIcon name="cog-b" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hydration Log Section (Progress + Controls) */}
        {isLoading ? (
          <HydrationLogSkeleton />
        ) : (
          <>
            {/* Progress Card */}
            <LinearGradient
              colors={['#ffd1b3', '#fcbcb9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressCard}
            >
              <View style={styles.progressCardWrapper}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Hydration Progress</Text>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressBadgeText}>
                      {Math.min(progressPercent, 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                {/* Circular Progress Indicator */}
                <View style={styles.circularProgressContainer}>
                  <View style={styles.circularProgress}>
                    <Text style={styles.circularProgressText}>
                      {totalGlasses}
                    </Text>
                    <Text style={styles.circularProgressLabel}>glasses</Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(progressPercent, 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                {remainingGlasses > 0 ? (
                  <View style={styles.remainingContainer}>
                    <FontelloIcon
                      name="water"
                      size={14}
                      color={THEME_COLORS.primary}
                    />
                    <Text style={styles.remainingText}>
                      {remainingGlasses} more glass
                      {remainingGlasses > 1 ? 'es' : ''} to reach your goal
                    </Text>
                  </View>
                ) : (
                  <View style={styles.goalReachedContainer}>
                    <Text style={styles.goalReachedText}>
                      🎉 Congratulations! Goal Achieved
                    </Text>
                  </View>
                )}
                {/* Stats Overview */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <Text style={styles.statIcon}>💧</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {totalLiters.toFixed(2)} L
                    </Text>
                    <Text style={styles.statLabel}>Today</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <Text style={styles.statIcon}>🎯</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {goalInLiters.toFixed(1)} L
                    </Text>
                    <Text style={styles.statLabel}>Goal</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <Text style={styles.statIcon}>🥤</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {hydrationLog?.glass_size_ml || 250}
                    </Text>
                    <Text style={styles.statLabel}>Glass ml</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Main Water Controls */}
            <View style={styles.waterControlsCard}>
              <View style={styles.waterControls}>
                <TouchableOpacity
                  onPress={handleRemoveGlass}
                  style={[
                    styles.waterControlBtn,
                    styles.removeBtn,
                    (isUpdating ||
                      !hydrationLog ||
                      hydrationLog.amount_ml === 0) &&
                      styles.buttonDisabled,
                  ]}
                  disabled={
                    isUpdating || !hydrationLog || hydrationLog.amount_ml === 0
                  }
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontelloIcon name="minus" size={24} color="#fff" />
                      <Text style={styles.waterControlBtnLabel}>Remove</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.glassesDisplay}>
                  <View style={styles.glassIconContainer}>
                    <Text style={styles.glassIcon}>🥤</Text>
                  </View>
                  <Text style={styles.glassesCount}>{totalGlasses}</Text>
                  <Text style={styles.glassesLabel}>glasses</Text>
                  <Text style={styles.glassesSubLabel}>
                    ({hydrationLog?.amount_ml || 0}ml)
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleAddGlass}
                  style={[
                    styles.waterControlBtn,
                    styles.addBtn,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontelloIcon name="plus" size={24} color="#fff" />
                      <Text style={styles.waterControlBtnLabel}>Add Glass</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Add Water Buttons */}
            <View style={styles.quickAddCard}>
              <Text style={styles.quickAddTitle}>Quick Add</Text>
              <View style={styles.quickAddButtons}>
                <TouchableOpacity
                  onPress={() => !isUpdating && addWater(100)}
                  style={[
                    styles.quickAddBtn,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                >
                  <Text style={styles.quickAddBtnText}>100ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => !isUpdating && addWater(250)}
                  style={[
                    styles.quickAddBtn,
                    styles.quickAddBtnPrimary,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                >
                  <Text
                    style={[
                      styles.quickAddBtnText,
                      styles.quickAddBtnTextPrimary,
                    ]}
                  >
                    250ml
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => !isUpdating && addWater(500)}
                  style={[
                    styles.quickAddBtn,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                >
                  <Text style={styles.quickAddBtnText}>500ml</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Hydration Info Card - Benefits & Tips */}
        {isContentLoading ? (
          <HydrationContentSkeleton />
        ) : hydrationContent ? (
          <>
            {/* Benefits Section */}
            {hydrationContent.benefits.length > 0 && (
              <InfoCard
                title="Hydration Benefits"
                emoji="💧"
                insights={hydrationContent.benefits.map(
                  b => `${b.icon} ${b.text}`,
                )}
                highlightColor={{
                  bgColor: THEME_COLORS.extraLightBg,
                  borderColor: THEME_COLORS.primary,
                  bulletColor: THEME_COLORS.primary,
                  boldColor: THEME_COLORS.secondary,
                }}
                cardStyle={{ marginBottom: STYLE.spacing.mv }}
              />
            )}

            {/* Tips Section */}
            {hydrationContent.tips.length > 0 && (
              <InfoCard
                title="Hydration Tips"
                emoji="💡"
                insights={hydrationContent.tips.map(t => `${t.icon} ${t.text}`)}
                highlightColor={{
                  bgColor: '#e0f7ed',
                  borderColor: THEME_COLORS.textMint,
                  bulletColor: '#52b788',
                  boldColor: '#2d6a4f',
                }}
                cardStyle={{ marginBottom: STYLE.spacing.mv }}
              />
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Water Settings Modal */}
      <Modal visible={waterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Water Settings</Text>
              <TouchableOpacity onPress={() => setWaterModalVisible(false)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Glass Size (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="Default: 250ml"
                keyboardType="numeric"
                value={glassSize}
                onChangeText={setGlassSize}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Goal (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="Default: 2000ml"
                keyboardType="numeric"
                value={dailyGoal}
                onChangeText={setDailyGoal}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setWaterModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  isUpdating && styles.buttonDisabled,
                ]}
                onPress={handleSaveSettings}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator
                    size="small"
                    color={THEME_COLORS.textLight}
                  />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fireworks Animation */}
      <Fireworks
        visible={showFireworks}
        onComplete={() => setShowFireworks(false)}
        duration={3000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: STYLE.spacing.mv,
    ...STYLE.header,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  settingsBtn: {
    padding: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  scrollContent: {
    ...STYLE.scrollContent,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },

  // Progress Card
  progressCard: {
    marginTop: 8,
    marginBottom: STYLE.spacing.mv,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  progressCardWrapper: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  progressBadge: {
    backgroundColor: 'rgba(248, 144, 156, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  circularProgress: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 6,
    borderColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME_COLORS.primary,
  },
  circularProgressLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  goalReachedContainer: {
    alignItems: 'center',
  },
  goalReachedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },

  // Quick Add Card
  quickAddCard: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAddTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 10,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAddBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.extraLightBg,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.LightBg,
    alignItems: 'center',
  },
  quickAddBtnPrimary: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  quickAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  quickAddBtnTextPrimary: {
    color: '#FFFFFF',
  },

  // Water Controls Card
  waterControlsCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginVertical: STYLE.spacing.mv,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  waterControlBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  removeBtn: {
    backgroundColor: THEME_COLORS.secondary,
  },
  addBtn: {
    backgroundColor: '#4ba96c',
  },
  waterControlBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  glassesDisplay: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  glassIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME_COLORS.extraLightBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  glassIcon: {
    fontSize: 28,
  },
  glassesCount: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME_COLORS.primary,
    marginBottom: 2,
  },
  glassesLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  glassesSubLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: THEME_COLORS.LightBg,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
    backgroundColor: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
