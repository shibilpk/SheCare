import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MenuView } from '@react-native-menu/menu';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { KeyboardAvoidingModal } from '../../components';
import { STYLE } from '../../constants/app';
import { useNutrition, type NutritionLog } from './useNutrition';
import { FoodNameInput, type FoodSuggestion } from '../../components/common/FoodNameInput';
import { ScreenLoader } from '../../components/common/ScreenLoader';

export default function NutritionScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateString = selectedDate.toISOString().split('T')[0];

  const {
    summary,
    isLoading,
    isUpdating,
    addNutritionLog,
    updateNutritionLog,
    deleteNutritionLog,
    updateGoal,
  } = useNutrition(dateString);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<NutritionLog | null>(null);

  // Meal form state (single object)
  const [mealForm, setMealForm] = useState({
    name: '',
    quantity: '100', // grams
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
  });

  // Goal state (single object)
  const [goalForm, setGoalForm] = useState({
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
  });

  // Update goal state when summary is loaded
  useEffect(() => {
    if (summary?.goal) {
      setGoalForm({
        calories: String(summary.goal.calories),
        carbs: String(summary.goal.carbs),
        protein: String(summary.goal.protein),
        fat: String(summary.goal.fat),
      });
    }
  }, [summary?.goal]);

  const handleSelectFoodSuggestion = (food: FoodSuggestion) => {
    // Food suggestions are per 100g, calculate based on current quantity
    const qty = Number(mealForm.quantity) || 100;
    const multiplier = qty / 100;

    setMealForm({
      name: food.name,
      quantity: mealForm.quantity,
      calories: String(Math.round(food.calories * multiplier)),
      carbs: String(Math.round(food.carbs * multiplier)),
      protein: String(Math.round(food.protein * multiplier)),
      fat: String(Math.round(food.fat * multiplier)),
    });
  };

  const resetMealForm = () => {
    setMealForm({
      name: '',
      quantity: '100',
      calories: '',
      carbs: '',
      protein: '',
      fat: '',
    });
  };

  const handleAddMeal = async () => {
    const calories = Number(mealForm.calories) || 0;
    const carbs = Number(mealForm.carbs) || 0;
    const protein = Number(mealForm.protein) || 0;
    const fat = Number(mealForm.fat) || 0;

    if (!mealForm.name.trim() || calories === 0) {
      Alert.alert('Error', 'Please enter a meal name and nutritional values');
      return;
    }

    try {
      const payload = {
        date: dateString,
        name: mealForm.name.trim(),
        quantity: Number(mealForm.quantity) || 100,
        calories: calories,
        carbs: carbs,
        protein: protein,
        fat: fat,
      };

      if (editingMeal) {
        await updateNutritionLog(editingMeal.id, payload);
      } else {
        await addNutritionLog(payload);
      }

      // Reset form
      resetMealForm();
      setEditingMeal(null);
      setShowAddModal(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || `Failed to ${editingMeal ? 'update' : 'add'} meal`
      );
    }
  };

  const handleEditMeal = (meal: NutritionLog) => {
    setEditingMeal(meal);
    setMealForm({
      name: meal.name,
      quantity: String(meal.quantity || 100),
      calories: String(meal.calories),
      carbs: String(meal.carbs),
      protein: String(meal.protein),
      fat: String(meal.fat),
    });
    setShowAddModal(true);
  };

  const handleDeleteMeal = async (logId: number, mealName: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNutritionLog(logId).catch((err: any) => {
              Alert.alert(
                'Error',
                err?.normalizedError?.message || 'Failed to delete meal'
              );
            });
          },
        },
      ]
    );
  };

  const handleUpdateGoal = async () => {
    const cals = Number(goalForm.calories) || 2000;
    const c = Number(goalForm.carbs) || 250;
    const p = Number(goalForm.protein) || 75;
    const f = Number(goalForm.fat) || 70;

    try {
      await updateGoal({
        calories: cals,
        carbs: c,
        protein: p,
        fat: f,
      });
      setShowGoalModal(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to update goal'
      );
    }
  };

  const totals = summary?.totals || { calories: 0, carbs: 0, protein: 0, fat: 0 };
  const goal = summary?.goal || { calories: 2000, carbs: 250, protein: 75, fat: 70 };
  const progress = summary?.progress || { calories: 0, carbs: 0, protein: 0, fat: 0 };
  const meals = summary?.logs || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <FontelloIcon name="left-open-mini" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <View style={styles.addBtn} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScreenLoader message="Loading nutrition data..." />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <FontelloIcon name="plus" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Selector */}
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <FontelloIcon name="calendar" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </TouchableOpacity>

        {/* Summary Card */}
        <LinearGradient
          colors={['#DCFCE7', '#BBF7D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <TouchableOpacity
            style={styles.summaryCardWrapper}
            onPress={() => setShowGoalModal(true)}
          >
            <Text style={styles.summaryTitle}>Today's Nutrition</Text>
            <Text style={styles.calorieValue}>{totals.calories} kcal</Text>
            <Text style={styles.goalText}>of {goal.calories} kcal goal</Text>

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: '#10B981' }]}>
                Carbs
              </Text>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroFill,
                    { width: `${progress.carbs}%`, backgroundColor: '#10B981' },
                  ]}
                />
              </View>
              <Text style={styles.macroAmount}>{totals.carbs}g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: '#3B82F6' }]}>
                Protein
              </Text>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroFill,
                    {
                      width: `${progress.protein}%`,
                      backgroundColor: '#3B82F6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroAmount}>{totals.protein}g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: '#F59E0B' }]}>Fat</Text>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroFill,
                    { width: `${progress.fat}%`, backgroundColor: '#F59E0B' },
                  ]}
                />
              </View>
              <Text style={styles.macroAmount}>{totals.fat}g</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Meals List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <Text style={styles.sectionCount}>{meals.length} items</Text>
        </View>

        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first meal</Text>
          </View>
        ) : (
          meals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealContent}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealMeta}>
                  {meal.quantity}g • {meal.carbs}g C • {meal.protein}g P • {meal.fat}g F
                </Text>
              </View>
              <View style={styles.mealCalsBox}>
                <Text style={styles.mealCals}>{meal.calories}</Text>
                <Text style={styles.mealCalsUnit}>kcal</Text>
              </View>
              <MenuView
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === 'edit') {
                    handleEditMeal(meal);
                  } else if (nativeEvent.event === 'delete') {
                    handleDeleteMeal(meal.id, meal.name);
                  }
                }}
                actions={[
                  {
                    id: 'edit',
                    title: 'Edit',
                    image: 'pencil',
                    imageColor: THEME_COLORS.primary,
                  },
                  {
                    id: 'delete',
                    title: 'Delete',
                    image: 'trash',
                    attributes: {
                      destructive: true,
                    },
                  },
                ]}
              >
                <View style={styles.menuButton}>
                  <FontelloIcon name="dot-3" size={20} color="#666" />
                </View>
              </MenuView>
            </View>
          ))
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontelloIcon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Healthy Nutrition</Text>
          </View>
          <Text style={styles.tipText}>
            • Eat balanced meals with whole grains, lean proteins, and healthy
            fats.
          </Text>
          <Text style={styles.tipText}>
            • Include folate-rich foods (spinach, beans) and iron sources.
          </Text>
          <Text style={styles.tipText}>
            • Snack smart: yogurt with fruit, nuts, hummus with veggies.
          </Text>
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <KeyboardAvoidingModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingMeal(null);
          resetMealForm();
        }}
        title={editingMeal ? 'Edit Meal' : 'Add Meal'}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <FoodNameInput
            value={mealForm.name}
            onChangeText={(text) => setMealForm({ ...mealForm, name: text })}
            onSelectSuggestion={handleSelectFoodSuggestion}
            placeholder="e.g., Greek Yogurt with Honey"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity (grams)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="100"
            value={mealForm.quantity}
            onChangeText={(text) => setMealForm({ ...mealForm, quantity: text })}
          />
          <Text style={styles.inputHint}>
            Food suggestions are per 100g. Values auto-adjust based on quantity.
          </Text>
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="kcal"
              value={mealForm.calories}
              onChangeText={(text) => setMealForm({ ...mealForm, calories: text })}
            />
          </View>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Carbs</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={mealForm.carbs}
              onChangeText={(text) => setMealForm({ ...mealForm, carbs: text })}
            />
          </View>
        </View>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Protein</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={mealForm.protein}
              onChangeText={(text) => setMealForm({ ...mealForm, protein: text })}
            />
          </View>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Fat</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={mealForm.fat}
              onChangeText={(text) => setMealForm({ ...mealForm, fat: text })}
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => {
              setShowAddModal(false);
              setEditingMeal(null);
              resetMealForm();
            }}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalSaveBtn, isUpdating && styles.modalSaveBtnDisabled]}
            onPress={handleAddMeal}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={THEME_COLORS.textLight} />
            ) : (
              <Text style={styles.modalSaveBtnText}>{editingMeal ? 'Update' : 'Add'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>

      {/* Goal Settings Modal */}
      <KeyboardAvoidingModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Nutrition Goals"
      >
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="kcal"
              value={goalForm.calories}
              onChangeText={(text) => setGoalForm({ ...goalForm, calories: text })}
            />
          </View>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Carbs</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={goalForm.carbs}
              onChangeText={(text) => setGoalForm({ ...goalForm, carbs: text })}
            />
          </View>
        </View>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Protein</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={goalForm.protein}
              onChangeText={(text) => setGoalForm({ ...goalForm, protein: text })}
            />
          </View>
          <View style={[styles.inputGroup, styles.rowInputItem]}>
            <Text style={styles.inputLabel}>Fat</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="g"
              value={goalForm.fat}
              onChangeText={(text) => setGoalForm({ ...goalForm, fat: text })}
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => setShowGoalModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalSaveBtn, isUpdating && styles.modalSaveBtnDisabled]}
            onPress={handleUpdateGoal}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={THEME_COLORS.textLight} />
            ) : (
              <Text style={styles.modalSaveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
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
    ...STYLE.header,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  addBtn: { padding: 4 },
  scrollContent: { paddingBottom: 40 },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },

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
  summaryTitle: { fontSize: 16, fontWeight: '700', color: THEME_COLORS.text },
  calorieValue: { fontSize: 44, fontWeight: '800', color: '#10B981' },
  goalText: { fontSize: 14, color: '#666', marginBottom: 12 },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  macroLabel: { width: 70, fontSize: 13, fontWeight: '700' },
  macroBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  macroFill: { height: '100%', borderRadius: 5 },
  macroAmount: { width: 60, textAlign: 'right', fontSize: 13, color: '#666' },

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

  mealCard: {
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
  mealContent: { flex: 1 },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  mealMeta: { fontSize: 13, color: '#999' },
  mealCalsBox: { alignItems: 'flex-end', marginRight: 8 },
  mealCals: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  mealCalsUnit: { fontSize: 12, color: '#666' },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
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
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  rowInputs: { flexDirection: 'row', gap: 12 },
  rowInputItem: { flex: 1 },

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
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
