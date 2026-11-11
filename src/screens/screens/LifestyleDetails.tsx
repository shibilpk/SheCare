import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LineChart } from 'react-native-chart-kit';
import { THEME_COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { STYLE } from '../../constants/app';
import { useProfile } from '../../hooks/useProfile';
import { useWeightEntries } from '../../hooks/useWeightEntries';
import { APIError } from '../../services/ApiClient';
import { parseLocalDate, toLocalDateString } from '../../utils/date';
import { useToastMessage } from '../../utils/toastMessage';

type EditField = 'weight' | 'height';
type WeightUnit = 'kg' | 'lb';

const MAX_CHART_LABELS = 6;

const formatShortDate = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const showApiError = (error: unknown, fallback: string) => {
  const apiError = error as APIError;
  Alert.alert(
    apiError?.normalizedError?.title || 'Error',
    apiError?.normalizedError?.message || fallback,
  );
};

const LifestyleDetailsScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    profile,
    isLoading: isProfileLoading,
    isSaving,
    error: profileError,
    fetchProfile,
    updateProfile,
    saveWeight,
  } = useProfile();
  const {
    entries,
    isLoading: isEntriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useWeightEntries(6);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [editField, setEditField] = useState<EditField | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const chartData = useMemo(() => {
    // Thin out labels so they don't overlap when there are many entries.
    const step = Math.max(1, Math.ceil(entries.length / MAX_CHART_LABELS));
    return {
      labels: entries.map((e, i) =>
        i % step === 0 ? formatShortDate(e.entry_date) : '',
      ),
      datasets: [
        {
          data: entries.map(e => Number(e.weight_kg)),
          color: () => THEME_COLORS.primary,
          strokeWidth: 3,
        },
      ],
    };
  }, [entries]);

  const latestEntry = entries.length ? entries[entries.length - 1] : null;
  const weightChange =
    entries.length >= 2
      ? Number(entries[entries.length - 1].weight_kg) -
        Number(entries[0].weight_kg)
      : null;

  const currentWeightValue = latestEntry
    ? `${Number(latestEntry.weight)}`
    : profile?.weight?.weight
    ? `${Number(profile.weight.weight)}`
    : '--';
  const currentWeightUnit =
    latestEntry?.unit || profile?.weight?.unit || 'kg';
  const heightValue =
    profile?.height !== undefined && profile?.height !== null
      ? `${profile.height}`
      : '--';
  const ageValue =
    profile?.age !== undefined && profile?.age !== null
      ? `${profile.age}`
      : '--';

  const isInitialLoading =
    (isProfileLoading && !profile) || (isEntriesLoading && !entries.length);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), refetchEntries()]);
    setRefreshing(false);
  };

  const openEdit = (field: EditField) => {
    if (field === 'weight') {
      setWeight('');
      setUnit(currentWeightUnit === 'lb' ? 'lb' : 'kg');
      setSelectedDate(new Date());
    } else {
      setHeight(heightValue === '--' ? '' : heightValue);
    }
    setEditField(field);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const handleDobConfirm = async (date: Date) => {
    setDobPickerVisible(false);
    try {
      const response = await updateProfile({
        date_of_birth: toLocalDateString(date),
      });
      showToast(response?.detail?.message || 'Date of birth updated', {
        type: 'success',
      });
    } catch (error) {
      showApiError(error, 'Failed to update date of birth');
    }
  };

  const handleSave = async () => {
    if (editField === 'weight') {
      const newWeight = parseFloat(weight);
      if (isNaN(newWeight) || newWeight <= 0) {
        Alert.alert('Invalid weight', 'Please enter a valid weight.');
        return;
      }
      try {
        const response = await saveWeight({
          weight: String(newWeight),
          weight_unit: unit,
          weight_date: toLocalDateString(selectedDate),
        });
        setEditField(null);
        showToast(response?.detail?.message || 'Weight saved', {
          type: 'success',
        });
        await Promise.all([refetchEntries(), fetchProfile()]);
      } catch (error) {
        showApiError(error, 'Failed to save weight');
      }
    } else if (editField === 'height') {
      const newHeight = parseFloat(height);
      if (isNaN(newHeight) || newHeight <= 0) {
        Alert.alert('Invalid height', 'Please enter a valid height in cm.');
        return;
      }
      try {
        const response = await updateProfile({ height: newHeight });
        setEditField(null);
        showToast(response?.detail?.message || 'Height updated', {
          type: 'success',
        });
      } catch (error) {
        showApiError(error, 'Failed to update height');
      }
    }
  };

  const renderChart = () => {
    if (isEntriesLoading && !entries.length) {
      return (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator color={THEME_COLORS.primary} />
        </View>
      );
    }
    if (entriesError && !entries.length) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>{entriesError}</Text>
          <TouchableOpacity onPress={refetchEntries}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // react-native-chart-kit misbehaves with fewer than 2 points.
    if (entries.length < 2) {
      return (
        <View style={styles.chartPlaceholder}>
          <FontelloIcon name="balance-scale" size={32} color="#ccc" />
          <Text style={styles.placeholderText}>
            {entries.length === 0
              ? 'No weight entries yet. Add your weight to start tracking.'
              : 'Add one more weight entry to see your progress chart.'}
          </Text>
        </View>
      );
    }
    return (
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 64}
        height={200}
        yAxisSuffix=" kg"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: THEME_COLORS.primary,
            fill: '#fff',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#f0f0f0',
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lifestyle Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={THEME_COLORS.primary}
              colors={[THEME_COLORS.primary]}
            />
          }
        >
          {profileError && !profile ? (
            <TouchableOpacity style={styles.errorBanner} onPress={fetchProfile}>
              <Text style={styles.errorBannerText}>
                {profileError} — tap to retry
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Weight Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Weight Progress</Text>
                <Text style={styles.progressSubtitle}>Last 6 months</Text>
              </View>
              {weightChange !== null && (
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {weightChange > 0 ? '+' : ''}
                    {weightChange.toFixed(1)} kg
                  </Text>
                </View>
              )}
            </View>

            {renderChart()}
          </View>

          {/* Health Stats Cards */}
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => openEdit('weight')}
            >
              <View style={[styles.statIcon, styles.statIconWeight]}>
                <FontelloIcon name="balance-scale" size={24} color="#6366F1" />
              </View>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>
                {currentWeightValue}{' '}
                <Text style={styles.statUnit}>{currentWeightUnit}</Text>
              </Text>
              <View style={styles.editBtn}>
                <FontelloIcon name="plus" size={12} color="#999" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => openEdit('height')}
            >
              <View style={[styles.statIcon, styles.statIconHeight]}>
                <FontelloIcon name="person" size={24} color="#EC4899" />
              </View>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>
                {heightValue} <Text style={styles.statUnit}>cm</Text>
              </Text>
              <View style={styles.editBtn}>
                <FontelloIcon name="pencil" size={12} color="#999" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => setDobPickerVisible(true)}
            >
              <View style={[styles.statIcon, styles.statIconAge]}>
                <FontelloIcon name="calendar" size={24} color="#10B981" />
              </View>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>
                {ageValue} <Text style={styles.statUnit}>yrs</Text>
              </Text>
              <View style={styles.editBtn}>
                <FontelloIcon name="pencil" size={12} color="#999" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Age is derived from date of birth, so editing it edits the DOB */}
      <DateTimePickerModal
        isVisible={dobPickerVisible}
        mode="date"
        date={
          profile?.date_of_birth
            ? parseLocalDate(profile.date_of_birth)
            : new Date(2000, 0, 1)
        }
        maximumDate={new Date()}
        onConfirm={handleDobConfirm}
        onCancel={() => setDobPickerVisible(false)}
      />

      {/* Edit Modal */}
      <Modal visible={editField !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editField === 'weight' ? 'Add Weight' : 'Edit Height'}
              </Text>
              <TouchableOpacity onPress={() => setEditField(null)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            {editField === 'weight' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter weight"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <View style={styles.unitRow}>
                    <TouchableOpacity
                      onPress={() => setUnit('kg')}
                      style={[
                        styles.unitBtn,
                        unit === 'kg' && styles.unitBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          unit === 'kg' && styles.unitTextActive,
                        ]}
                      >
                        kg
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setUnit('lb')}
                      style={[
                        styles.unitBtn,
                        unit === 'lb' && styles.unitBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          unit === 'lb' && styles.unitTextActive,
                        ]}
                      >
                        lb
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
                      {selectedDate.toLocaleDateString()}
                    </Text>
                    <FontelloIcon name="calendar" size={20} color="#999" />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={datePickerVisible}
                    mode="date"
                    date={selectedDate}
                    maximumDate={new Date()}
                    onConfirm={handleConfirm}
                    onCancel={() => setDatePickerVisible(false)}
                  />
                </View>
              </>
            )}

            {editField === 'height' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter height"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditField(null)}
                disabled={isSaving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    width: 36,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollContent: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#F0E6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
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
    color: '#fff',
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
    color: '#333',
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
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
  },
  statIconWeight: {
    backgroundColor: '#E0E7FF',
  },
  statIconHeight: {
    backgroundColor: '#FCE7F3',
  },
  statIconAge: {
    backgroundColor: '#D1FAE5',
  },
});

export default LifestyleDetailsScreen;
