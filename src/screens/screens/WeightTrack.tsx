import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { STYLE } from '../../constants/app';

const { width } = Dimensions.get('window');

interface WeightEntry {
  id: number;
  age: string;
  ageInMonths: number;
  weight: number;
  date: string;
  gain: number;
}

export default function WeightTrackScreen() {
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newAge, setNewAge] = useState('');
  const [unit, setUnit] = useState('kg');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [weightData, setWeightData] = useState<WeightEntry[]>([
    { id: 1, age: '6 months', ageInMonths: 6, weight: 7.5, date: 'Jul 15, 2025', gain: 0 },
    { id: 2, age: '9 months', ageInMonths: 9, weight: 8.9, date: 'Aug 12, 2025', gain: 1.4 },
    { id: 3, age: '12 months', ageInMonths: 12, weight: 9.6, date: 'Sep 9, 2025', gain: 0.7 },
    { id: 4, age: '15 months', ageInMonths: 15, weight: 10.3, date: 'Oct 7, 2025', gain: 0.7 },
    { id: 5, age: '18 months', ageInMonths: 18, weight: 10.9, date: 'Nov 4, 2025', gain: 0.6 },
  ]);

  const startWeight = weightData[0].weight;
  const currentWeight = weightData[weightData.length - 1].weight;
  const totalGain = currentWeight - startWeight;
  const currentAge = weightData[weightData.length - 1].age;
  const currentAgeMonths = weightData[weightData.length - 1].ageInMonths;

  const maxWeight = Math.max(...weightData.map(d => d.weight));
  const minWeight = Math.min(...weightData.map(d => d.weight));

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const handleSaveWeight = () => {
    if (newWeight && newAge) {
      let weightInKg = parseFloat(newWeight);
      if (isNaN(weightInKg)) return;

      // Convert grams to kg if needed
      if (unit === 'g') {
        weightInKg = weightInKg / 1000;
      }

      const ageMonths = parseInt(newAge);
      if (isNaN(ageMonths)) return;

      const ageString = ageMonths >= 12
        ? `${Math.floor(ageMonths / 12)} year${Math.floor(ageMonths / 12) > 1 ? 's' : ''}${ageMonths % 12 > 0 ? ` ${ageMonths % 12}m` : ''}`
        : `${ageMonths} month${ageMonths > 1 ? 's' : ''}`;

      const previousWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : weightInKg;
      const gain = weightInKg - previousWeight;

      const newEntry: WeightEntry = {
        id: weightData.length + 1,
        age: ageString,
        ageInMonths: ageMonths,
        weight: parseFloat(weightInKg.toFixed(1)),
        date: selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        gain: parseFloat(gain.toFixed(1)),
      };

      setWeightData([...weightData, newEntry]);
      setShowAddModal(false);
      setNewWeight('');
      setNewAge('');
      setUnit('kg');
      setSelectedDate(new Date());
    }
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
        <Text style={styles.headerTitle}>Child's Weight</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addBtn}
        >
          <FontelloIcon name="plus" size={24} color={THEME_COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Stats Card */}
        <LinearGradient
          colors={['#FEE2E2', '#FECACA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{currentWeight} kg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{currentAge}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Gain</Text>
              <Text style={styles.statValue}>+{totalGain.toFixed(1)} kg</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Growth Progress</Text>
            <Text style={styles.chartSubtitle}>Last {currentAgeMonths - weightData[0].ageInMonths} months</Text>
          </View>

          {/* Simple Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>{maxWeight}</Text>
              <Text style={styles.yAxisLabel}>
                {Math.round((maxWeight + minWeight) / 2)}
              </Text>
              <Text style={styles.yAxisLabel}>{minWeight}</Text>
            </View>
            <View style={styles.chartContent}>
              {weightData.map((entry, index) => {
                const heightPercent =
                  ((entry.weight - minWeight) / (maxWeight - minWeight)) * 100;
                return (
                  <View key={entry.id} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor:
                              index === weightData.length - 1
                                ? '#EF4444'
                                : '#FCA5A5',
                          },
                        ]}
                      >
                        <Text style={styles.barValue}>{entry.weight}</Text>
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{entry.ageInMonths}m</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Guidelines Card */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <FontelloIcon name="info-circled" size={20} color="#8B5CF6" />
            <Text style={styles.guidelinesTitle}>Growth Guidelines</Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.guidelineDot} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>0-3 months:</Text> Gain 150-200g
              per week
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.guidelineDot} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>3-6 months:</Text> Gain 100-150g
              per week
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.guidelineDot} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>6-12 months:</Text> Gain 70-90g
              per week
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <View style={styles.guidelineDot} />
            <Text style={styles.guidelineText}>
              <Text style={styles.guidelineBold}>1-2 years:</Text> Gain 2-3 kg
              per year
            </Text>
          </View>
          <Text style={styles.guidelineNote}>
            Note: Every child grows at their own pace. Consult your pediatrician for
            personalized advice.
          </Text>
        </View>

        {/* History List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weight History</Text>
        </View>

        {[...weightData].reverse().map(entry => (
          <View key={entry.id} style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyWeek}>{entry.age}</Text>
              <Text style={styles.historyDate}>{entry.date}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyWeight}>{entry.weight} kg</Text>
              {entry.gain > 0 && (
                <Text style={styles.historyGain}>+{entry.gain.toFixed(1)} kg</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Weight Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Weight Entry</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Child's Age (in months)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 6, 12, 18"
                keyboardType="numeric"
                value={newAge}
                onChangeText={setNewAge}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter weight"
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.unitRow}>
                <TouchableOpacity
                  onPress={() => setUnit('kg')}
                  style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
                >
                  <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUnit('g')}
                  style={[styles.unitBtn, unit === 'g' && styles.unitBtnActive]}
                >
                  <Text style={[styles.unitText, unit === 'g' && styles.unitTextActive]}>
                    grams
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                style={styles.dateBtn}
              >
                <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                <FontelloIcon name="calendar" size={20} color="#999" />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                date={selectedDate}
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisible(false)}
              />
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
                onPress={handleSaveWeight}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  addBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME_COLORS.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  chartCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
  },
  chartYAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#999',
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    minHeight: 40,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME_COLORS.textLight,
  },
  barLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  guidelinesCard: {
    backgroundColor: '#F3E8FF',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  guidelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
  },
  guidelineText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  guidelineBold: {
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  guidelineNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  historyLeft: {
    flex: 1,
  },
  historyWeek: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#999',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  historyGain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
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
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
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
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  unitTextActive: {
    color: THEME_COLORS.textLight,
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  dateText: {
    fontSize: 15,
    color: THEME_COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
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
