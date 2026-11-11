import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { STYLE } from '../../constants/app';
import { ScreenLoader } from '../../components/common/ScreenLoader';
import { useToastMessage } from '../../utils/toastMessage';
import { parseLocalDate, toLocalDateString } from '../../utils/date';
import { ChildWeightEntry, useChildWeights } from './useChildWeights';

// Max bars shown in the chart (most recent entries)
const CHART_MAX_BARS = 8;

/** Round to at most 2 decimals for display (7.5, 10.25). */
const fmtKg = (kg: number) => String(Number(kg.toFixed(2)));

/** 'YYYY-MM-DD' -> 'Jul 15, 2025' */
const formatDate = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function WeightTrackScreen() {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    entries: weightData,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch,
    addEntry,
    deleteEntry,
  } = useChildWeights();
  // Refresh failures while data is already shown surface as a toast
  const refreshError = weightData.length ? error : null;
  useEffect(() => {
    if (refreshError) {
      showToast(refreshError);
    }
    // showToast is recreated every render; only react to new errors
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshError]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newAge, setNewAge] = useState('');
  const [unit, setUnit] = useState('kg');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const hasData = weightData.length > 0;
  const first = hasData ? weightData[0] : null;
  const latest = hasData ? weightData[weightData.length - 1] : null;
  const totalGain = first && latest ? latest.weight_kg - first.weight_kg : 0;

  const chartData = weightData.slice(-CHART_MAX_BARS);
  const chartWeights = chartData.map(d => d.weight_kg);
  const maxWeight = chartWeights.length ? Math.max(...chartWeights) : 0;
  const minWeight = chartWeights.length ? Math.min(...chartWeights) : 0;
  const chartSpanMonths =
    chartData.length > 1
      ? chartData[chartData.length - 1].age_months - chartData[0].age_months
      : 0;

  const resetForm = () => {
    setNewWeight('');
    setNewAge('');
    setUnit('kg');
    setSelectedDate(new Date());
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const handleSaveWeight = async () => {
    let weightInKg = parseFloat(newWeight.replace(',', '.'));
    const ageMonths = parseInt(newAge, 10);

    if (isNaN(ageMonths) || ageMonths < 0 || ageMonths > 240) {
      showToast('Enter an age between 0 and 240 months');
      return;
    }
    if (isNaN(weightInKg) || weightInKg <= 0) {
      showToast('Enter a valid weight');
      return;
    }

    // Convert grams to kg if needed
    if (unit === 'g') {
      weightInKg = weightInKg / 1000;
    }

    try {
      await addEntry({
        entry_date: toLocalDateString(selectedDate),
        age_months: ageMonths,
        weight_kg: Number(weightInKg.toFixed(2)),
      });
      showToast('Weight saved');
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save weight');
    }
  };

  const confirmDelete = (entry: ChildWeightEntry) => {
    Alert.alert(
      'Delete Entry',
      `Delete ${fmtKg(entry.weight_kg)} kg from ${formatDate(entry.entry_date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              showToast('Entry deleted');
            } catch (err: any) {
              showToast(err?.message || 'Failed to delete entry');
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
        <FontelloIcon name="left-open-mini" size={26} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Child's Weight</Text>
      <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
        <FontelloIcon name="plus" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !hasData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <ScreenLoader message="Loading weight history..." />
      </SafeAreaView>
    );
  }

  if (error && !hasData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <View style={styles.stateBox}>
          <FontelloIcon name="attention" size={40} color="#EF4444" />
          <Text style={styles.stateTitle}>Couldn't load weight history</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.stateBtn} onPress={() => refetch()}>
            <Text style={styles.stateBtnText}>Retry</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch(true)}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      >
        {latest ? (
          <>
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
                  <Text style={styles.statValue}>
                    {fmtKg(latest.weight_kg)} kg
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Age</Text>
                  <Text style={styles.statValue}>{latest.age_label}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Gain</Text>
                  <Text style={styles.statValue}>
                    {totalGain >= 0 ? '+' : ''}
                    {totalGain.toFixed(1)} kg
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Chart Card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Growth Progress</Text>
                <Text style={styles.chartSubtitle}>
                  {chartData.length > 1
                    ? `Last ${chartSpanMonths} month${
                        chartSpanMonths === 1 ? '' : 's'
                      } · ${chartData.length} entries`
                    : 'Add more entries to see the trend'}
                </Text>
              </View>

              {/* Simple Bar Chart */}
              <View style={styles.chartContainer}>
                <View style={styles.chartYAxis}>
                  <Text style={styles.yAxisLabel}>{fmtKg(maxWeight)}</Text>
                  <Text style={styles.yAxisLabel}>
                    {fmtKg((maxWeight + minWeight) / 2)}
                  </Text>
                  <Text style={styles.yAxisLabel}>{fmtKg(minWeight)}</Text>
                </View>
                <View style={styles.chartContent}>
                  {chartData.map((entry, index) => {
                    const range = maxWeight - minWeight;
                    const heightPercent =
                      range > 0
                        ? ((entry.weight_kg - minWeight) / range) * 100
                        : 100;
                    return (
                      <View key={entry.id} style={styles.barContainer}>
                        <View style={styles.barWrapper}>
                          <View
                            style={[
                              styles.bar,
                              index === chartData.length - 1
                                ? styles.barLatest
                                : styles.barPrevious,
                              { height: `${heightPercent}%` },
                            ]}
                          >
                            <Text style={styles.barValue}>
                              {fmtKg(entry.weight_kg)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.barLabel}>{entry.age_months}m</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <FontelloIcon
              name="balance-scale"
              size={40}
              color={THEME_COLORS.primary}
            />
            <Text style={styles.stateTitle}>No weight entries yet</Text>
            <Text style={styles.stateText}>
              Log your child's weight to track growth over time.
            </Text>
            <TouchableOpacity style={styles.stateBtn} onPress={openAddModal}>
              <Text style={styles.stateBtnText}>Add First Entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Guidelines Card */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <FontelloIcon name="attention" size={20} color="#8B5CF6" />
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
        {hasData && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weight History</Text>
          </View>
        )}

        {[...weightData].reverse().map(entry => (
          <View key={entry.id} style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyWeek}>{entry.age_label}</Text>
              <Text style={styles.historyDate}>
                {formatDate(entry.entry_date)}
              </Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyWeight}>
                {fmtKg(entry.weight_kg)} kg
              </Text>
              {entry.gain_kg !== 0 && (
                <Text
                  style={[
                    styles.historyGain,
                    entry.gain_kg < 0 && styles.historyLoss,
                  ]}
                >
                  {entry.gain_kg > 0 ? '+' : ''}
                  {fmtKg(entry.gain_kg)} kg
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.historyDeleteBtn}
              onPress={() => confirmDelete(entry)}
              disabled={isSaving}
              hitSlop={8}
            >
              <FontelloIcon name="trash-empty" size={18} color="#EF4444" />
            </TouchableOpacity>
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
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={newAge}
                onChangeText={setNewAge}
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder={unit === 'g' ? 'e.g., 7500' : 'e.g., 7.5'}
                placeholderTextColor="#999"
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
                <Text style={styles.dateText}>
                  {formatDate(toLocalDateString(selectedDate))}
                </Text>
                <FontelloIcon name="calendar" size={20} color="#999" />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                date={selectedDate}
                maximumDate={new Date()}
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
                style={[styles.modalSaveBtn, isSaving && styles.disabled]}
                onPress={handleSaveWeight}
                disabled={isSaving}
              >
                {isSaving ? (
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
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
  barLatest: {
    backgroundColor: '#EF4444',
  },
  barPrevious: {
    backgroundColor: '#FCA5A5',
  },
  historyLoss: {
    color: '#EF4444',
  },
  historyDeleteBtn: {
    marginLeft: 14,
    padding: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginTop: 16,
    marginBottom: 6,
  },
  stateText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  stateBtn: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stateBtnText: {
    color: THEME_COLORS.textLight,
    fontWeight: '600',
    fontSize: 15,
  },
});
