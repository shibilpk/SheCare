import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { STYLE } from '../../constants/app';
import { ScreenLoader } from '../../components/common/ScreenLoader';
import { useErrorToast, useToastMessage } from '../../utils/toastMessage';
import { parseLocalDate, toLocalDateString } from '../../utils/date';
import { useSleepLog, SleepEntry, SleepQuality } from './useSleepLog';

const QUALITIES: SleepQuality[] = ['Poor', 'Fair', 'Good', 'Excellent'];
const SLEEP_PURPLE = '#8B5CF6';

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

/** "Tue, Nov 11, 2026" (accepts YYYY-MM-DD or a Date) */
function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? parseLocalDate(value) : value;
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${String(
    d.getDate(),
  ).padStart(2, '0')}, ${d.getFullYear()}`;
}

function formatHours(hours: number): string {
  return `${Number(hours).toFixed(1)} hrs`;
}

export default function SleepLogScreen() {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    data,
    isLoading,
    isRefreshing,
    isUpdating,
    error,
    refetch,
    saveEntry,
    deleteEntry,
  } = useSleepLog();

  const [showAddModal, setShowAddModal] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [newDate, setNewDate] = useState<Date>(() => new Date());
  const [newDuration, setNewDuration] = useState('');
  const [newQuality, setNewQuality] = useState<SleepQuality>('Good');

  // Initial load errors get a full error view; later refresh errors are toasted.
  useErrorToast(data ? error : null);

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const stats = data?.stats;
  const newDateStr = toLocalDateString(newDate);
  const existingForDate = entries.find(e => e.date === newDateStr);

  const resetForm = () => {
    setNewDate(new Date());
    setNewDuration('');
    setNewQuality('Good');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (entry: SleepEntry) => {
    setNewDate(parseLocalDate(entry.date));
    setNewDuration(String(entry.duration_hours));
    setNewQuality(entry.quality);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const submitEntry = async (durationHours: number) => {
    try {
      await saveEntry({
        date: newDateStr,
        duration_hours: durationHours,
        quality: newQuality,
      });
      showToast(existingForDate ? 'Sleep entry updated' : 'Sleep entry added');
      closeModal();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save sleep entry');
    }
  };

  const handleAddEntry = () => {
    if (isUpdating) return;
    const hours = parseFloat(newDuration.replace(',', '.'));
    if (
      !newDuration.trim() ||
      !Number.isFinite(hours) ||
      hours <= 0 ||
      hours > 24
    ) {
      Alert.alert(
        'Invalid duration',
        'Enter the hours you slept — more than 0 and at most 24.',
      );
      return;
    }
    const rounded = Math.round(hours * 10) / 10;
    if (rounded <= 0) {
      Alert.alert('Invalid duration', 'Duration must be at least 0.1 hours.');
      return;
    }
    submitEntry(rounded);
  };

  const confirmDelete = (entry: SleepEntry) => {
    Alert.alert(
      'Delete Sleep Entry',
      `Remove the entry for ${formatDate(entry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              showToast('Sleep entry removed');
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.message || 'Failed to delete sleep entry',
              );
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
        style={styles.headerBtn}
      >
        <FontelloIcon name="left-open-mini" size={26} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Sleep Log</Text>
      <TouchableOpacity
        onPress={openAddModal}
        style={styles.headerBtn}
        disabled={isLoading || (!data && !!error)}
      >
        <FontelloIcon name="plus" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <ScreenLoader message="Loading sleep log..." />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <View style={styles.errorState}>
          <FontelloIcon name="attention" size={40} color="#F59E0B" />
          <Text style={styles.errorTitle}>Couldn't load your sleep log</Text>
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

  const average = stats?.average_hours_7d ?? null;
  const goalHours = stats?.goal_hours ?? 8;
  const averageProgress =
    average != null ? Math.min(100, (average / goalHours) * 100) : 0;

  const statsCard = (
    <View style={styles.statsCard}>
      <View style={styles.statsRow}>
        <View style={styles.statsIconBox}>
          <FontelloIcon name="moon" size={22} color={SLEEP_PURPLE} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.statsLabel}>7-day average</Text>
          <Text style={styles.statsValue}>
            {average != null ? formatHours(average) : '—'}
            <Text style={styles.statsGoal}> / {goalHours} hrs goal</Text>
          </Text>
        </View>
      </View>
      <View style={styles.statsBar}>
        <View style={[styles.statsBarFill, { width: `${averageProgress}%` }]} />
      </View>
      <Text style={styles.statsSub}>
        {stats && stats.entries_7d > 0
          ? `Based on ${stats.entries_7d} ${
              stats.entries_7d === 1 ? 'night' : 'nights'
            } logged in the last 7 days`
          : 'No nights logged in the last 7 days'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {header}

      <FlatList
        data={entries}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={statsCard}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={SLEEP_PURPLE}
            colors={[SLEEP_PURPLE]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😴</Text>
            <Text style={styles.emptyTitle}>No sleep entries yet</Text>
            <Text style={styles.emptyText}>
              Log how long and how well you slept to see trends here.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAddModal}>
              <Text style={styles.emptyBtnText}>Add Sleep Entry</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => openEditModal(item)}
            onLongPress={() => confirmDelete(item)}
          >
            <View style={styles.iconBox}>
              <FontelloIcon name="moon" size={20} color={SLEEP_PURPLE} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <View style={styles.row}>
                <Text style={styles.duration}>
                  {formatHours(item.duration_hours)}
                </Text>
                <Text style={styles.quality}>{item.quality}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              style={styles.deleteBtn}
              disabled={isUpdating}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontelloIcon name="trash-empty" size={18} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Add Entry Modal */}
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
                {existingForDate ? 'Update Sleep Entry' : 'Add Sleep Entry'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  onPress={() => setDatePickerVisible(true)}
                  style={styles.dateBtn}
                >
                  <Text style={styles.dateText}>{formatDate(newDate)}</Text>
                  <FontelloIcon name="calendar" size={20} color="#999" />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={datePickerVisible}
                  mode="date"
                  date={newDate}
                  maximumDate={new Date()}
                  onConfirm={date => {
                    setDatePickerVisible(false);
                    setNewDate(date);
                  }}
                  onCancel={() => setDatePickerVisible(false)}
                />
                {existingForDate && (
                  <View style={styles.overwriteNotice}>
                    <FontelloIcon name="attention" size={14} color="#B45309" />
                    <Text style={styles.overwriteText}>
                      You already logged{' '}
                      {formatHours(existingForDate.duration_hours)} (
                      {existingForDate.quality}) for this night. Saving will
                      replace it.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (hours)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 7.5"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={newDuration}
                  onChangeText={setNewDuration}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sleep Quality</Text>
                <View style={styles.qualityRow}>
                  {QUALITIES.map(quality => (
                    <TouchableOpacity
                      key={quality}
                      onPress={() => setNewQuality(quality)}
                      style={[
                        styles.qualityBtn,
                        newQuality === quality && styles.qualityBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.qualityText,
                          newQuality === quality && styles.qualityTextActive,
                        ]}
                      >
                        {quality}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

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
                onPress={handleAddEntry}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator
                    size="small"
                    color={THEME_COLORS.textLight}
                  />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {existingForDate ? 'Replace' : 'Add'}
                  </Text>
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
  headerBtn: { padding: 4, width: 32 },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 10 },
  duration: { fontSize: 14, color: '#666' },
  quality: { fontSize: 14, color: SLEEP_PURPLE, fontWeight: '700' },
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
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
    backgroundColor: THEME_COLORS.textLight,
  },
  qualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  qualityBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityBtnActive: {
    backgroundColor: SLEEP_PURPLE,
    borderColor: SLEEP_PURPLE,
  },
  qualityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  qualityTextActive: {
    color: THEME_COLORS.textLight,
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
    backgroundColor: SLEEP_PURPLE,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
  flex1: { flex: 1 },
  listContent: { paddingBottom: 24 },
  deleteBtn: { padding: 6, marginLeft: 8 },
  statsCard: {
    backgroundColor: '#F3E8FF',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsLabel: { fontSize: 13, color: '#666', marginBottom: 2 },
  statsValue: { fontSize: 24, fontWeight: '800', color: SLEEP_PURPLE },
  statsGoal: { fontSize: 13, fontWeight: '600', color: '#666' },
  statsBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    marginTop: 14,
  },
  statsBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: SLEEP_PURPLE,
  },
  statsSub: { fontSize: 12, color: '#666', marginTop: 8 },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: SLEEP_PURPLE,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
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
    backgroundColor: SLEEP_PURPLE,
    minWidth: 140,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '600',
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
  dateText: { fontSize: 15, color: THEME_COLORS.text },
  overwriteNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  overwriteText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 },
  modalSaveBtnDisabled: { opacity: 0.7 },
});
