import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { STYLE } from '../../constants/app';
import { KeyboardAvoidingModal } from '../../components';
import { ScreenLoader } from '../../components/common/ScreenLoader';
import { useToastMessage } from '../../utils/toastMessage';
import { parseLocalDate, toLocalDateString } from '../../utils/date';
import {
  Appointment,
  AppointmentPayload,
  useAppointments,
} from './useAppointments';

const APPOINTMENT_TYPES = [
  { key: 'scan', label: 'Scan', icon: 'stethoscope', color: '#8B5CF6' },
  { key: 'checkup', label: 'Check-up', icon: 'heart', color: '#EC4899' },
  { key: 'blood', label: 'Blood test', icon: 'droplet', color: '#EF4444' },
  { key: 'other', label: 'Other', icon: 'calendar', color: '#3B82F6' },
];

const findType = (icon: string, color: string) =>
  APPOINTMENT_TYPES.find(t => t.icon === icon && t.color === color) ??
  APPOINTMENT_TYPES.find(t => t.icon === icon) ??
  APPOINTMENT_TYPES[0];

/** 'YYYY-MM-DD' -> 'Tue, Oct 10, 2025' */
const formatDate = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/** 'HH:MM[:SS]' -> '2:30 PM' */
const formatTime = (time: string | null) => {
  if (!time) {
    return '';
  }
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
};

/** Date -> 'HH:MM' */
const toTimeString = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0',
  )}`;

/** 'HH:MM[:SS]' -> Date (today, at that time) */
const timeToDate = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const toPayload = (a: Appointment): AppointmentPayload => ({
  title: a.title,
  doctor: a.doctor,
  location: a.location,
  date: a.date,
  time: a.time ? a.time.slice(0, 5) : null,
  notes: a.notes,
  icon: a.icon,
  color: a.color,
  is_completed: a.is_completed,
});

export default function AppointmentsScreen() {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    appointments,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();
  // Refresh failures while data is already shown surface as a toast
  const refreshError = appointments.length ? error : null;
  useEffect(() => {
    if (refreshError) {
      showToast(refreshError);
    }
    // showToast is recreated every render; only react to new errors
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshError]);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [typeKey, setTypeKey] = useState(APPOINTMENT_TYPES[0].key);
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const sections = useMemo(() => {
    const today = toLocalDateString(new Date());
    const upcoming = appointments.filter(
      a => !a.is_completed && a.date >= today,
    );
    // Most recent first for past/completed
    const past = appointments
      .filter(a => a.is_completed || a.date < today)
      .reverse();
    return [
      ...(upcoming.length ? [{ title: 'Upcoming', data: upcoming }] : []),
      ...(past.length ? [{ title: 'Past & Completed', data: past }] : []),
    ];
  }, [appointments]);

  const resetForm = () => {
    setEditing(null);
    setTypeKey(APPOINTMENT_TYPES[0].key);
    setTitle('');
    setDoctor('');
    setLocation('');
    setDate(new Date());
    setTime(null);
    setNotes('');
    setIsCompleted(false);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (a: Appointment) => {
    setEditing(a);
    setTypeKey(findType(a.icon, a.color).key);
    setTitle(a.title);
    setDoctor(a.doctor);
    setLocation(a.location);
    setDate(parseLocalDate(a.date));
    setTime(a.time ? timeToDate(a.time) : null);
    setNotes(a.notes);
    setIsCompleted(a.is_completed);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const selectType = (key: string) => {
    const prev = APPOINTMENT_TYPES.find(t => t.key === typeKey);
    const next = APPOINTMENT_TYPES.find(t => t.key === key);
    // Pre-fill the title with the type label unless the user typed their own
    if (next && (!title.trim() || title === prev?.label)) {
      setTitle(next.key === 'other' ? '' : next.label);
    }
    setTypeKey(key);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title');
      return;
    }
    const type =
      APPOINTMENT_TYPES.find(t => t.key === typeKey) ?? APPOINTMENT_TYPES[0];
    const payload: AppointmentPayload = {
      title: title.trim(),
      doctor: doctor.trim(),
      location: location.trim(),
      date: toLocalDateString(date),
      time: time ? toTimeString(time) : null,
      notes: notes.trim(),
      icon: type.icon,
      color: type.color,
      is_completed: isCompleted,
    };
    try {
      if (editing) {
        await updateAppointment(editing.id, payload);
        showToast('Appointment updated');
      } else {
        await createAppointment(payload);
        showToast('Appointment added');
      }
      closeModal();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save appointment');
    }
  };

  const toggleCompleted = async (a: Appointment) => {
    try {
      await updateAppointment(a.id, {
        ...toPayload(a),
        is_completed: !a.is_completed,
      });
      showToast(a.is_completed ? 'Marked as not completed' : 'Marked as completed');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update appointment');
    }
  };

  const confirmDelete = (a: Appointment) => {
    Alert.alert('Delete Appointment', `Delete "${a.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAppointment(a.id);
            showToast('Appointment deleted');
            if (editing?.id === a.id) {
              closeModal();
            }
          } catch (err: any) {
            showToast(err?.message || 'Failed to delete appointment');
          }
        },
      },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerBtn}
      >
        <FontelloIcon name="left-open-mini" size={26} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Appointments</Text>
      <TouchableOpacity onPress={openAdd} style={styles.headerBtn}>
        <FontelloIcon name="plus" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const renderCard = ({ item }: { item: Appointment }) => {
    const today = toLocalDateString(new Date());
    const isPast = item.is_completed || item.date < today;
    return (
      <TouchableOpacity
        style={[styles.card, isPast && styles.cardPast]}
        activeOpacity={0.8}
        onPress={() => openEdit(item)}
        onLongPress={() => confirmDelete(item)}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
          <FontelloIcon
            name={item.icon}
            size={20}
            color={THEME_COLORS.textLight}
          />
        </View>
        <View style={styles.cardBody}>
          <Text
            style={[styles.title, item.is_completed && styles.titleCompleted]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!!item.doctor && (
            <Text style={styles.sub} numberOfLines={1}>
              {item.doctor}
            </Text>
          )}
          {!!item.location && (
            <View style={styles.locationRow}>
              <FontelloIcon name="location" size={12} color="#999" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
          <View style={styles.bottomRow}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            {!!item.time && (
              <Text style={styles.time}>{formatTime(item.time)}</Text>
            )}
            {item.is_completed && (
              <Text style={styles.completedBadge}>Completed</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.completeBtn,
            item.is_completed && styles.completeBtnActive,
          ]}
          onPress={() => toggleCompleted(item)}
          disabled={isSaving}
          hitSlop={8}
        >
          <FontelloIcon
            name="check"
            size={14}
            color={item.is_completed ? THEME_COLORS.textLight : '#bbb'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading && appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        <ScreenLoader message="Loading appointments..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {header}

      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch(true)}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={renderCard}
        ListEmptyComponent={
          error ? (
            <View style={styles.stateBox}>
              <FontelloIcon name="attention" size={40} color="#EF4444" />
              <Text style={styles.stateTitle}>Couldn't load appointments</Text>
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity
                style={styles.stateBtn}
                onPress={() => refetch()}
              >
                <Text style={styles.stateBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stateBox}>
              <FontelloIcon
                name="calendar"
                size={40}
                color={THEME_COLORS.primary}
              />
              <Text style={styles.stateTitle}>No appointments yet</Text>
              <Text style={styles.stateText}>
                Keep track of scans, check-ups and tests in one place.
              </Text>
              <TouchableOpacity style={styles.stateBtn} onPress={openAdd}>
                <Text style={styles.stateBtnText}>Add Appointment</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <KeyboardAvoidingModal
        visible={showModal}
        onClose={closeModal}
        title={editing ? 'Edit Appointment' : 'New Appointment'}
        showScrollView
        maxHeight="90%"
      >
        <Text style={styles.inputLabel}>Type</Text>
        <View style={styles.typeRow}>
          {APPOINTMENT_TYPES.map(t => {
            const selected = t.key === typeKey;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeChip,
                  selected && { backgroundColor: t.color, borderColor: t.color },
                ]}
                onPress={() => selectType(t.key)}
              >
                <FontelloIcon
                  name={t.icon}
                  size={14}
                  color={selected ? THEME_COLORS.textLight : t.color}
                />
                <Text
                  style={[styles.typeChipText, selected && styles.typeChipTextActive]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Ultrasound Scan"
          placeholderTextColor="#999"
          maxLength={150}
        />

        <Text style={styles.inputLabel}>Doctor</Text>
        <TextInput
          style={styles.input}
          value={doctor}
          onChangeText={setDoctor}
          placeholder="e.g. Dr. Sarah Johnson"
          placeholderTextColor="#999"
          maxLength={150}
        />

        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Clinic or hospital"
          placeholderTextColor="#999"
          maxLength={200}
        />

        <View style={styles.dateTimeRow}>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text style={styles.pickerText}>
                {formatDate(toLocalDateString(date))}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>Time</Text>
            <View style={styles.pickerBtn}>
              <TouchableOpacity
                style={styles.flex1}
                onPress={() => setTimePickerVisible(true)}
              >
                <Text style={[styles.pickerText, !time && styles.placeholder]}>
                  {time ? formatTime(toTimeString(time)) : 'Optional'}
                </Text>
              </TouchableOpacity>
              {time ? (
                <TouchableOpacity onPress={() => setTime(null)} hitSlop={8}>
                  <FontelloIcon name="cancel" size={16} color="#999" />
                </TouchableOpacity>
              ) : (
                <FontelloIcon name="clock" size={16} color="#999" />
              )}
            </View>
          </View>
        </View>

        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Questions to ask, things to bring..."
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />

        {editing && (
          <TouchableOpacity
            style={styles.completedToggle}
            onPress={() => setIsCompleted(v => !v)}
          >
            <View
              style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
            >
              {isCompleted && (
                <FontelloIcon
                  name="check"
                  size={12}
                  color={THEME_COLORS.textLight}
                />
              )}
            </View>
            <Text style={styles.completedToggleText}>Mark as completed</Text>
          </TouchableOpacity>
        )}

        <View style={styles.modalActions}>
          {editing ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(editing)}
              disabled={isSaving}
            >
              <FontelloIcon name="trash-empty" size={18} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.disabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={THEME_COLORS.textLight} />
            ) : (
              <Text style={styles.saveBtnText}>
                {editing ? 'Save Changes' : 'Add Appointment'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="date"
          date={date}
          onConfirm={d => {
            setDate(d);
            setDatePickerVisible(false);
          }}
          onCancel={() => setDatePickerVisible(false)}
        />
        <DateTimePickerModal
          isVisible={timePickerVisible}
          mode="time"
          date={time ?? timeToDate('09:00')}
          onConfirm={d => {
            setTime(d);
            setTimePickerVisible(false);
          }}
          onCancel={() => setTimePickerVisible(false)}
        />
      </KeyboardAvoidingModal>
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
  listContent: { paddingBottom: 32, flexGrow: 1 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  cardPast: { opacity: 0.7 },
  cardBody: { flex: 1 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  titleCompleted: { textDecorationLine: 'line-through', color: '#888' },
  sub: { fontSize: 14, color: '#666', marginBottom: 4 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: { fontSize: 13, color: '#888', flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  date: { fontSize: 13, color: '#999' },
  time: { fontSize: 13, color: THEME_COLORS.primary, fontWeight: '600' },
  completedBadge: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  completeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  completeBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  notesInput: { minHeight: 80 },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  typeChipTextActive: { color: THEME_COLORS.textLight },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pickerText: { fontSize: 14, color: THEME_COLORS.text },
  placeholder: { color: '#999' },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#10B981' },
  completedToggleText: { fontSize: 15, color: THEME_COLORS.text },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
  deleteBtn: {
    width: 50,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
  disabled: { opacity: 0.6 },
});
