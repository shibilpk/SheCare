import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { STYLE } from '../../constants/app';
import { ScreenLoader } from '../../components/common/ScreenLoader';
import { useErrorToast, useToastMessage } from '../../utils/toastMessage';
import { parseLocalDate, toLocalDateString } from '../../utils/date';
import {
  useExercise,
  ExerciseType,
  ExerciseLog,
  ExerciseIntensity,
} from './useExercise';

const FILTER_CATEGORIES = [
  'All',
  'Cardio',
  'Strength',
  'Flexibility',
  'Sports',
] as const;

const DEFAULT_GOAL = { minutes: 150, calories: 500 };

const NAME_EMOJI: Record<string, string> = {
  cricket: '🏏',
  'prenatal yoga': '🧘‍♀️',
  yoga: '🧘‍♀️',
  'brisk walk': '🚶‍♀️',
  walking: '🚶‍♀️',
  swimming: '🏊‍♀️',
  cycling: '🚴‍♀️',
  dancing: '💃',
  pilates: '🤸‍♀️',
  stretching: '🧘',
  jogging: '🏃‍♀️',
  running: '🏃‍♀️',
  aerobics: '🎯',
  badminton: '🏸',
  tennis: '🎾',
};

const CATEGORY_EMOJI: Record<ExerciseType['category'], string> = {
  Cardio: '🏃‍♀️',
  Strength: '🏋️‍♀️',
  Flexibility: '🧘‍♀️',
  Sports: '⚽',
};

function emojiFor(name: string, category?: ExerciseType['category']): string {
  return (
    NAME_EMOJI[name.trim().toLowerCase()] ||
    (category ? CATEGORY_EMOJI[category] : undefined) ||
    '💪'
  );
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Mon, Nov 10" from YYYY-MM-DD */
function formatDay(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Nov 10" from YYYY-MM-DD */
function formatShort(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function ExerciseScreen() {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const today = useMemo(() => toLocalDateString(new Date()), []);
  const {
    types,
    summary,
    isLoading,
    isRefreshing,
    isUpdating,
    error,
    refetch,
    addLog,
    deleteLog,
  } = useExercise(today);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null,
  );
  const [minutes, setMinutes] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('Low');
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof FILTER_CATEGORIES)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load errors get a full error view; later refresh errors are toasted.
  useErrorToast(summary ? error : null);

  const filteredExercises = types.filter(ex => {
    const matchesCategory =
      selectedFilter === 'All' || ex.category === selectedFilter;
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const workouts: ExerciseLog[] = useMemo(
    () =>
      [...(summary?.logs || [])].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
      ),
    [summary],
  );
  const totals = summary?.totals || { minutes: 0, calories: 0 };
  const goal = summary?.goal || DEFAULT_GOAL;
  const progress = summary?.progress || { minutes: 0, calories: 0 };

  const typeById = useMemo(() => {
    const map = new Map<number, ExerciseType>();
    types.forEach(t => map.set(t.id, t));
    return map;
  }, [types]);

  const estimatedCalories =
    selectedExercise && Number(minutes) > 0
      ? Math.round(selectedExercise.calories_per_minute * Number(minutes))
      : null;

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedExercise(null);
    setMinutes('');
    setCalories('');
    setIntensity('Low');
  };

  const handleSelectExercise = (exercise: ExerciseType) => {
    setSelectedExercise(exercise);
    setShowAddModal(true);
    setMinutes('');
    setCalories('');
    setIntensity('Low');
  };

  const addWorkout = async () => {
    if (!selectedExercise || isUpdating) return;
    const m = Number(minutes);
    if (!minutes.trim() || !Number.isInteger(m) || m < 1 || m > 1440) {
      Alert.alert(
        'Invalid duration',
        'Enter whole minutes between 1 and 1440.',
      );
      return;
    }
    let c = 0;
    if (calories.trim()) {
      c = Number(calories);
      if (!Number.isFinite(c) || c < 0) {
        Alert.alert(
          'Invalid calories',
          'Enter a positive number, or leave it blank to estimate.',
        );
        return;
      }
      c = Math.round(c);
    }
    try {
      await addLog({
        exercise_type_id: selectedExercise.id,
        date: today,
        minutes: m,
        calories: c,
        intensity,
      });
      closeModal();
      showToast(`${selectedExercise.name} added`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add workout');
    }
  };

  const confirmDelete = (workout: ExerciseLog) => {
    Alert.alert(
      'Delete Workout',
      `Remove ${workout.name} (${workout.minutes} min) on ${formatDay(
        workout.date,
      )}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLog(workout.id);
              showToast('Workout removed');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete workout');
            }
          },
        },
      ],
    );
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <FontelloIcon name="left-open-mini" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Exercise</Text>
      <View style={styles.addBtn} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <ScreenLoader message="Loading exercise data..." />
      </SafeAreaView>
    );
  }

  if (error && !summary) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <View style={styles.errorState}>
          <FontelloIcon name="attention" size={40} color="#F59E0B" />
          <Text style={styles.errorTitle}>Couldn't load exercise data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={refetch}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={THEME_COLORS.textLight} />
            ) : (
              <Text style={styles.retryBtnText}>Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      >
        {/* Summary Card */}
        <LinearGradient
          colors={['#CFFAFE', '#A5F3FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryCardWrapper}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryTitle}>This Week</Text>
              {summary && (
                <Text style={styles.summaryRange}>
                  {formatShort(summary.week_start)} –{' '}
                  {formatShort(summary.week_end)}
                </Text>
              )}
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Minutes</Text>
                <Text style={[styles.summaryValue, { color: '#06B6D4' }]}>
                  {totals.minutes}
                </Text>
                <Text style={styles.summarySub}>of {goal.minutes} min</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Calories</Text>
                <Text style={[styles.summaryValue, { color: '#0EA5E9' }]}>
                  {totals.calories}
                </Text>
                <Text style={styles.summarySub}>of {goal.calories} kcal</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: '#06B6D4' }]}>
                Minutes
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, progress.minutes)}%`,
                      backgroundColor: '#06B6D4',
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: '#0EA5E9' }]}>
                Calories
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, progress.calories)}%`,
                      backgroundColor: '#0EA5E9',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Workouts List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <Text style={styles.sectionCount}>
            {workouts.length} {workouts.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {workouts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🏃‍♀️</Text>
            <Text style={styles.emptyTitle}>No workouts this week yet</Text>
            <Text style={styles.emptyText}>
              Pick an exercise below to log your first workout.
            </Text>
          </View>
        ) : (
          workouts.map(w => {
            const type =
              w.exercise_type_id != null
                ? typeById.get(w.exercise_type_id)
                : undefined;
            return (
              <View key={w.id} style={styles.workoutCard}>
                <View style={styles.workoutIcon}>
                  <Text style={styles.workoutEmoji}>
                    {emojiFor(w.name, type?.category)}
                  </Text>
                </View>
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {formatDay(w.date)} • {w.minutes} min • {w.calories} kcal •{' '}
                    {w.intensity}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(w)}
                  style={styles.deleteBtn}
                  disabled={isUpdating}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontelloIcon name="trash-empty" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Exercises List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Exercises</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontelloIcon name="cancel" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedFilter(category)}
              style={[
                styles.filterBtn,
                selectedFilter === category && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === category && styles.filterTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredExercises.length === 0 ? (
          <Text style={styles.noResults}>
            {types.length === 0
              ? 'No exercises available right now.'
              : 'No exercises match your search.'}
          </Text>
        ) : (
          <View style={styles.exercisesGrid}>
            {filteredExercises.map(exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleSelectExercise(exercise)}
              >
                <View style={styles.exerciseIconBox}>
                  <Text style={styles.exerciseEmoji}>
                    {emojiFor(exercise.name, exercise.category)}
                  </Text>
                </View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsEmoji}>💡</Text>
            <Text style={styles.tipsTitle}>Safe Exercise Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Aim for {goal.minutes} minutes/week of moderate activity (if
            approved by your provider).
          </Text>
          <Text style={styles.tipText}>
            • Stay hydrated and avoid overheating; choose low-impact activities.
          </Text>
          <Text style={styles.tipText}>
            • Stop if you feel dizziness, chest pain, or contractions.
          </Text>
        </View>
      </ScrollView>

      {/* Add Workout Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {selectedExercise?.name}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Minutes</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="e.g., 30"
                  placeholderTextColor="#999"
                  value={minutes}
                  onChangeText={setMinutes}
                />
              </View>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder={
                    estimatedCalories != null
                      ? `Auto (~${estimatedCalories})`
                      : 'Auto'
                  }
                  placeholderTextColor="#999"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
            </View>
            <Text style={styles.inputHint}>
              Leave calories blank and we'll estimate them for you.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Intensity</Text>
              <View style={styles.intensityRow}>
                {(['Low', 'Moderate', 'High'] as const).map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setIntensity(level)}
                    style={[
                      styles.intensityBtn,
                      intensity === level && styles.intensityBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        intensity === level && styles.intensityTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closeModal}
                disabled={isUpdating}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  isUpdating && styles.modalSaveBtnDisabled,
                ]}
                onPress={addWorkout}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator
                    size="small"
                    color={THEME_COLORS.textLight}
                  />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  addBtn: { width: 32 },
  scrollContent: { paddingBottom: 40 },

  summaryCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCardWrapper: {
    padding: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  summaryValue: { fontSize: 34, fontWeight: '800' },
  summarySub: { fontSize: 12, color: '#666' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.1)' },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  progressLabel: { width: 80, fontSize: 13, fontWeight: '700' },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: THEME_COLORS.text },
  sectionCount: { fontSize: 14, fontWeight: '600', color: '#999' },

  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  workoutEmoji: { fontSize: 20 },
  workoutContent: { flex: 1 },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  workoutMeta: { fontSize: 13, color: '#999' },

  exercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  exerciseCard: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exerciseEmoji: { fontSize: 28 },
  exerciseName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },

  tipsCard: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: THEME_COLORS.text },
  tipText: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.text },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
    backgroundColor: THEME_COLORS.textLight,
  },
  rowInputs: { flexDirection: 'row', gap: 12 },
  rowInputItem: { flex: 1 },
  intensityRow: { flexDirection: 'row', gap: 8 },
  intensityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  intensityBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  intensityText: { fontSize: 14, fontWeight: '600', color: '#666' },
  intensityTextActive: { color: THEME_COLORS.textLight },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#666' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: THEME_COLORS.textLight,
  },
  filterBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: THEME_COLORS.textLight },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.textLight,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
  },
  tipsEmoji: { fontSize: 18 },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryRange: { fontSize: 13, fontWeight: '600', color: '#0E7490' },
  deleteBtn: { padding: 6, marginLeft: 8 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center' },
  noResults: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputHint: { fontSize: 12, color: '#999', marginTop: -8, marginBottom: 16 },
  modalSaveBtnDisabled: { opacity: 0.7 },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.text },
  errorMessage: { fontSize: 14, color: '#666', textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    minWidth: 140,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
