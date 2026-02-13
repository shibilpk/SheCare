import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { KeyboardAvoidingModal } from '../../components';
import { STYLE } from '../../constants/app';

interface MealItem {
  id: number;
  name: string;
  calories: number;
  carbs: number; // g
  protein: number; // g
  fat: number; // g
}

export default function NutritionScreen() {
  const navigation = useNavigation();
  const [meals, setMeals] = useState<MealItem[]>([
    {
      id: 1,
      name: 'Oatmeal with Berries',
      calories: 320,
      carbs: 52,
      protein: 10,
      fat: 8,
    },
    {
      id: 2,
      name: 'Grilled Chicken Salad',
      calories: 420,
      carbs: 28,
      protein: 36,
      fat: 16,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      carbs: acc.carbs + m.carbs,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 },
  );

  const goal = { calories: 2000, carbs: 250, protein: 75, fat: 70 };
  const progress = {
    calories: Math.min(100, (totals.calories / goal.calories) * 100),
    carbs: Math.min(100, (totals.carbs / goal.carbs) * 100),
    protein: Math.min(100, (totals.protein / goal.protein) * 100),
    fat: Math.min(100, (totals.fat / goal.fat) * 100),
  };

  const addMeal = () => {
    const cals = Number(calories) || 0;
    const c = Number(carbs) || 0;
    const p = Number(protein) || 0;
    const f = Number(fat) || 0;
    if (!name || !cals) return;
    setMeals(prev => [
      ...prev,
      { id: Date.now(), name, calories: cals, carbs: c, protein: p, fat: f },
    ]);
    setName('');
    setCalories('');
    setCarbs('');
    setProtein('');
    setFat('');
    setShowAddModal(false);
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
        {/* Summary Card */}
        <LinearGradient
          colors={['#DCFCE7', '#BBF7D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryCardWrapper}>
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
          </View>
        </LinearGradient>

        {/* Meals List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <Text style={styles.sectionCount}>{meals.length} items</Text>
        </View>

        {meals.map((m, idx) => (
          <View key={m.id} style={styles.mealCard}>
            <View style={styles.mealIcon}>
              <Text style={styles.mealEmoji}>
                {idx % 3 === 0 ? '🍳' : idx % 3 === 1 ? '🥗' : '🍲'}
              </Text>
            </View>
            <View style={styles.mealContent}>
              <Text style={styles.mealName}>{m.name}</Text>
              <Text style={styles.mealMeta}>
                {m.carbs}g C • {m.protein}g P • {m.fat}g F
              </Text>
            </View>
            <View style={styles.mealCalsBox}>
              <Text style={styles.mealCals}>{m.calories}</Text>
              <Text style={styles.mealCalsUnit}>kcal</Text>
            </View>
          </View>
        ))}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontelloIcon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Healthy Pregnancy Nutrition</Text>
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
        onClose={() => setShowAddModal(false)}
        title="Add Meal"
      >
        <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Greek Yogurt with Honey"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="kcal"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Carbs</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="g"
                  value={carbs}
                  onChangeText={setCarbs}
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
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View style={[styles.inputGroup, styles.rowInputItem]}>
                <Text style={styles.inputLabel}>Fat</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="g"
                  value={fat}
                  onChangeText={setFat}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={addMeal}>
                <Text style={styles.modalSaveBtnText}>Add</Text>
              </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>
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
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mealEmoji: { fontSize: 22 },
  mealContent: { flex: 1 },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  mealMeta: { fontSize: 13, color: '#999' },
  mealCalsBox: { alignItems: 'flex-end' },
  mealCals: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  mealCalsUnit: { fontSize: 12, color: '#666' },

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
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
