import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';

interface ExerciseSuggestion {
  id: number;
  name: string;
  category: 'Cardio' | 'Strength' | 'Flexibility' | 'Sports';
}

interface WorkoutItem {
  id: number;
  name: string;
  exerciseId: number;
  minutes: number;
  calories: number;
  intensity: 'Low' | 'Moderate' | 'High';
}

const EXERCISE_SUGGESTIONS: ExerciseSuggestion[] = [
  { id: 1, name: 'Cricket', category: 'Sports' },
  { id: 2, name: 'Prenatal Yoga', category: 'Flexibility' },
  { id: 3, name: 'Brisk Walk', category: 'Cardio' },
  { id: 4, name: 'Swimming', category: 'Cardio' },
  { id: 5, name: 'Cycling', category: 'Cardio' },
  { id: 6, name: 'Dancing', category: 'Cardio' },
  { id: 7, name: 'Pilates', category: 'Strength' },
  { id: 8, name: 'Stretching', category: 'Flexibility' },
  { id: 9, name: 'Jogging', category: 'Cardio' },
  { id: 10, name: 'Aerobics', category: 'Cardio' },
  { id: 11, name: 'Badminton', category: 'Sports' },
  { id: 12, name: 'Tennis', category: 'Sports' },
];

const FILTER_CATEGORIES = [
  'All',
  'Cardio',
  'Strength',
  'Flexibility',
  'Sports',
] as const;

export default function ExerciseScreen() {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    {
      id: 1,
      name: 'Prenatal Yoga',
      exerciseId: 2,
      minutes: 30,
      calories: 120,
      intensity: 'Low',
    },
    {
      id: 2,
      name: 'Brisk Walk',
      exerciseId: 3,
      minutes: 25,
      calories: 140,
      intensity: 'Moderate',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseSuggestion | null>(null);
  const [minutes, setMinutes] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState<WorkoutItem['intensity']>('Low');
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof FILTER_CATEGORIES)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = EXERCISE_SUGGESTIONS.filter(ex => {
    const matchesCategory =
      selectedFilter === 'All' || ex.category === selectedFilter;
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totals = workouts.reduce(
    (acc, w) => ({
      minutes: acc.minutes + w.minutes,
      calories: acc.calories + w.calories,
    }),
    { minutes: 0, calories: 0 },
  );

  const goal = { minutes: 150, calories: 500 };
  const progress = {
    minutes: Math.min(100, (totals.minutes / goal.minutes) * 100),
    calories: Math.min(100, (totals.calories / goal.calories) * 100),
  };

  const handleSelectExercise = (exercise: ExerciseSuggestion) => {
    setSelectedExercise(exercise);
    setShowAddModal(true);
    setMinutes('');
    setCalories('');
    setIntensity('Low');
  };

  const addWorkout = () => {
    if (!selectedExercise || !minutes) return;
    const m = Number(minutes) || 0;
    const c = Number(calories) || 0;
    setWorkouts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: selectedExercise.name,
        exerciseId: selectedExercise.id,
        minutes: m,
        calories: c,
        intensity,
      },
    ]);
    setShowAddModal(false);
    setSelectedExercise(null);
    setMinutes('');
    setCalories('');
    setIntensity('Low');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Card */}
        <LinearGradient
          colors={['#CFFAFE', '#A5F3FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryCardWrapper}>
            <Text style={styles.summaryTitle}>This Week</Text>
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
                      width: `${progress.minutes}%`,
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
                      width: `${progress.calories}%`,
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
          <Text style={styles.sectionCount}>{workouts.length} items</Text>
        </View>

        {workouts.map((w, idx) => (
          <View key={w.id} style={styles.workoutCard}>
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutEmoji}>
                {idx % 3 === 0 ? '🤰' : idx % 3 === 1 ? '🚶‍♀️' : '🧘‍♀️'}
              </Text>
            </View>
            <View style={styles.workoutContent}>
              <Text style={styles.workoutName}>{w.name}</Text>
              <Text style={styles.workoutMeta}>
                {w.minutes} min • {w.calories} kcal • {w.intensity}
              </Text>
            </View>
          </View>
        ))}

        {/* Exercises List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Exercises</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <FontelloIcon
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
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

        <View style={styles.exercisesGrid}>
          {filteredExercises.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleSelectExercise(exercise)}
            >
              <View style={styles.exerciseIconBox}>
                <Text style={styles.exerciseEmoji}>
                  {exercise.id === 1
                    ? '🏏'
                    : exercise.id === 2
                      ? '🧘‍♀️'
                      : exercise.id === 3
                        ? '🚶‍♀️'
                        : exercise.id === 4
                          ? '🏊‍♀️'
                          : exercise.id === 5
                            ? '🚴‍♀️'
                            : exercise.id === 6
                              ? '💃'
                              : exercise.id === 7
                                ? '🤸‍♀️'
                                : exercise.id === 8
                                  ? '🧘'
                                  : exercise.id === 9
                                    ? '🏃‍♀️'
                                    : exercise.id === 10
                                      ? '🎯'
                                      : exercise.id === 11
                                        ? '🏸'
                                        : exercise.id === 12
                                          ? '🎾'
                                          : '⚽'}
                </Text>
              </View>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontelloIcon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Safe Exercise Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Aim for 150 minutes/week of moderate activity (if approved by your
            provider).
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
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {selectedExercise?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Minutes</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="e.g., 30"
                  value={minutes}
                  onChangeText={setMinutes}
                />
              </View>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="e.g., 120"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
            </View>

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
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={addWorkout}
              >
                <Text style={styles.modalSaveBtnText}>Add</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.text },
  addBtn: { width: 32 },
  scrollContent: { paddingBottom: 40 },

  summaryCard: {
    marginHorizontal: 20,
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
    marginBottom: 12,
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.textLight,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
  },
});
