import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuView } from '@react-native-menu/menu';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAvoidingModal } from '../../components';
import { STYLE } from '../../constants/app';
import { useMedication, CreateMedicationPayload, MedicationWithDoses } from './useMedication';

// Helper function to generate icon based on medication name
const getMedicationIcon = (name: string): string => {
  const lowerName = name.toLowerCase();

  // Vitamins
  if (lowerName.includes('vitamin d')) return 'sun';
  if (lowerName.includes('vitamin c')) return 'leaf';
  if (lowerName.includes('vitamin e')) return 'heart';
  if (lowerName.includes('vitamin a')) return 'eye';
  if (lowerName.includes('vitamin b')) return 'flash';
  if (lowerName.includes('vitamin')) return 'leaf';

  // Minerals
  if (lowerName.includes('calcium')) return 'food';
  if (lowerName.includes('iron')) return 'plus-circled';
  if (lowerName.includes('magnesium')) return 'lightning';
  if (lowerName.includes('zinc')) return 'shield';

  // Specific supplements
  if (lowerName.includes('folic') || lowerName.includes('acid')) return 'droplet';
  if (lowerName.includes('prenatal')) return 'heart';
  if (lowerName.includes('dha') || lowerName.includes('omega')) return 'water';
  if (lowerName.includes('probiotic')) return 'users';
  if (lowerName.includes('fiber')) return 'grain';
  if (lowerName.includes('protein')) return 'muscle';

  // General categories
  if (lowerName.includes('supplement')) return 'plus';
  if (lowerName.includes('multivitamin')) return 'star';
  if (lowerName.includes('herbal')) return 'leaf';

  return 'pharmacy';
};

export default function MedicationsScreen() {
  const navigation = useNavigation();
  const {
    medications,
    stats,
    isLoading,
    isSaving,
    fetchMedications,
    fetchStats,
    createMedication,
    updateMedication,
    toggleDose,
    deleteMedication,
  } = useMedication();

  const [currentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationWithDoses | null>(null);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [frequencyPeriod, setFrequencyPeriod] = useState('daily');
  const [timesPerPeriod, setTimesPerPeriod] = useState(1);
  const [selectedColor, setSelectedColor] = useState('#EC4899');

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchMedications(currentDate),
      fetchStats(currentDate),
    ]);
  }, [currentDate, fetchMedications, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleDose = async (medId: number, doseIndex: number, currentTaken: boolean) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      await toggleDose({
        medication_id: medId,
        date: dateStr,
        dose_index: doseIndex,
        taken: !currentTaken,
      });
    } catch (error) {
      console.error('Failed to toggle dose:', error);
    }
  };

  // Calculate completion percentage
  const totalDoses = stats?.total_doses || 0;
  const takenDoses = stats?.taken_doses || 0;
  const completionPercent = stats?.completion_percent || 0;

  const colorOptions = [
    '#EC4899', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B',
    '#3B82F6', '#06B6D4', '#F43F5E', '#84CC16', '#A855F7',
  ];

  const handleTimesChange = (newTimes: number) => {
    setTimesPerPeriod(newTimes);
  };

  const handleSaveMedication = async () => {
    if (newMedName.trim() && newDosage.trim()) {
      try {
        const payload: CreateMedicationPayload = {
          name: newMedName.trim(),
          dosage: newDosage.trim(),
          frequency_period: frequencyPeriod as any,
          times_per_period: timesPerPeriod,
          color: selectedColor,
          icon: getMedicationIcon(newMedName),
        };

        if (editingMedication) {
          await updateMedication(editingMedication.id, payload);
        } else {
          await createMedication(payload);
        }

        await loadData(); // Reload data
        resetForm();
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to save medication:', error);
      }
    }
  };

  const handleEdit = (med: MedicationWithDoses) => {
    setEditingMedication(med);
    setNewMedName(med.name);
    setNewDosage(med.dosage);
    // Parse frequency back to period - need to map from frequency text
    // For now, default to daily
    setFrequencyPeriod('daily');
    setTimesPerPeriod(med.doses.length);
    setSelectedColor(med.color);
    setShowAddModal(true);
  };

  const handleDelete = (med: MedicationWithDoses) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${med.name}?\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(med.id);
              await loadData(); // Reload data
            } catch (error) {
              console.error('Failed to delete medication:', error);
              Alert.alert('Error', 'Failed to delete medication. Please try again.');
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setNewMedName('');
    setNewDosage('');
    setFrequencyPeriod('daily');
    setTimesPerPeriod(1);
    setSelectedColor('#EC4899');
    setEditingMedication(null);
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
        <Text style={styles.headerTitle}>Medications & Vitamins</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addBtn}
          disabled={isSaving}
        >
          <FontelloIcon name="plus" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Loading medications...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Progress Card */}
          <LinearGradient
            colors={['#FCE7F3', '#FBCFE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressCard}
          >
            <View style={styles.progressCardWrapper}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>Today's Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {takenDoses} of {totalDoses} doses taken
                  </Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>
                    {Math.round(completionPercent)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${completionPercent}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Medications List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>

          {medications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontelloIcon name="pharmacy" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Medications Yet</Text>
              <Text style={styles.emptyText}>
                Add your first medication to start tracking
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <FontelloIcon name="plus" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            medications.map(med => (
              <View key={med.id} style={styles.medCard}>
                <View
                  style={[
                    styles.medIconContainer,
                    { backgroundColor: `${med.color}20` },
                  ]}
                >
                  <FontelloIcon name={med.icon} size={24} color={med.color} />
                </View>
                <View style={styles.medContent}>
                  <View style={styles.medHeader}>
                    <View style={styles.medTitleContainer}>
                      <Text style={styles.medName}>{med.name}</Text>
                    </View>
                    <MenuView
                      onPressAction={({ nativeEvent }) => {
                        if (nativeEvent.event === 'edit') {
                          handleEdit(med);
                        } else if (nativeEvent.event === 'delete') {
                          handleDelete(med);
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
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  <View style={styles.medMeta}>
                    <FontelloIcon name="clock" size={12} color="#999" />
                    <Text style={styles.medFrequency}>  {med.frequency}</Text>
                  </View>

                  {/* Dose Schedule */}
                  <View style={styles.doseScheduleContainer}>
                    {med.doses.map((dose, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.doseItem,
                          dose.taken && styles.doseItemTaken,
                        ]}
                        onPress={() => handleToggleDose(med.id, index, dose.taken)}
                      >
                        <FontelloIcon
                          name="clock"
                          size={10}
                          color={dose.taken ? THEME_COLORS.textLight : '#999'}
                        />
                        <Text style={[
                          styles.doseTime,
                          dose.taken && styles.doseTimeTaken,
                        ]}>
                          {dose.time}
                        </Text>
                        {dose.taken && (
                          <FontelloIcon
                            name="ok"
                            size={10}
                            color={THEME_COLORS.textLight}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Tips Section */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <FontelloIcon name="info-circled" size={20} color="#3B82F6" />
              <Text style={styles.tipsTitle}>Important Reminders</Text>
            </View>
            <Text style={styles.tipText}>
              • Take iron supplements with vitamin C for better absorption
            </Text>
            <Text style={styles.tipText}>
              • Avoid taking calcium and iron together
            </Text>
            <Text style={styles.tipText}>
              • Set daily reminders to maintain consistency
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Add/Edit Medication Modal */}
      <KeyboardAvoidingModal
        visible={showAddModal}
        onClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
        title={editingMedication ? 'Edit Medication' : 'Add Medication'}
        showScrollView={true}
      >
        <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Medication Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Prenatal Vitamin"
                    value={newMedName}
                    onChangeText={setNewMedName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dosage</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1 tablet, 400mcg"
                    value={newDosage}
                    onChangeText={setNewDosage}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Period</Text>
                  <View style={styles.periodRow}>
                    {['once', 'daily', 'weekly', 'monthly', 'yearly'].map(period => (
                      <TouchableOpacity
                        key={period}
                        onPress={() => {
                          setFrequencyPeriod(period);
                          if (period === 'once') {
                            handleTimesChange(1);
                          }
                        }}
                        style={[
                          styles.periodBtn,
                          frequencyPeriod === period && styles.periodBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodText,
                            frequencyPeriod === period && styles.periodTextActive,
                          ]}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {frequencyPeriod !== 'once' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>How many times per {frequencyPeriod}?</Text>
                    <View style={styles.timesRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <TouchableOpacity
                          key={num}
                          onPress={() => handleTimesChange(num)}
                          style={[
                            styles.timesBtn,
                            timesPerPeriod === num && styles.timesBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.timesText,
                              timesPerPeriod === num && styles.timesTextActive,
                            ]}
                          >
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <View style={styles.colorRow}>
                    {colorOptions.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorBtn,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorBtnActive,
                        ]}
                      >
                        {selectedColor === color && (
                          <FontelloIcon name="ok" size={16} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

        <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveMedication}
                >
                  <Text style={styles.modalSaveBtnText}>Save</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  progressCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCardWrapper: {
    padding: 20,
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
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EC4899',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
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
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medContent: {
    flex: 1,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  medTitleContainer: {
    flex: 1,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  medMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  medFrequency: {
    fontSize: 13,
    color: '#999',
  },
  doseScheduleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doseItemTaken: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  doseTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  doseTimeTaken: {
    color: THEME_COLORS.textLight,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
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
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: THEME_COLORS.textLight,
  },
  timesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  timesBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  timesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timesTextActive: {
    color: THEME_COLORS.textLight,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnActive: {
    borderColor: '#333',
    borderWidth: 3,
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
