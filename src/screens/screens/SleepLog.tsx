import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { STYLE } from '../../constants/app';

interface SleepEntry {
  id: number;
  date: string;
  durationHrs: number;
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

const INITIAL_ENTRIES: SleepEntry[] = [
  { id: 1, date: 'Oct 01, 2025', durationHrs: 7.5, quality: 'Good' },
  { id: 2, date: 'Oct 02, 2025', durationHrs: 6.0, quality: 'Fair' },
  { id: 3, date: 'Oct 03, 2025', durationHrs: 8.2, quality: 'Excellent' },
];

export default function SleepLogScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState<SleepEntry[]>(INITIAL_ENTRIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newQuality, setNewQuality] = useState<
    'Poor' | 'Fair' | 'Good' | 'Excellent'
  >('Good');
  const handleAddEntry = () => {
    if (newDate.trim() && newDuration.trim()) {
      const newEntry: SleepEntry = {
        id: entries.length + 1,
        date: newDate.trim(),
        durationHrs: parseFloat(newDuration) || 0,
        quality: newQuality,
      };
      setEntries([newEntry, ...entries]);
      resetForm();
      setShowAddModal(false);
    }
  };

  const resetForm = () => {
    setNewDate('');
    setNewDuration('');
    setNewQuality('Good');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Log</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.headerBtn}
        >
          <FontelloIcon name="plus" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <FontelloIcon name="moon" size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.row}>
                <Text style={styles.duration}>
                  {item.durationHrs.toFixed(1)} hrs
                </Text>
                <Text style={styles.quality}>{item.quality}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Add Entry Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Sleep Entry</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Oct 04, 2025"
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (hours)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 7.5"
                  keyboardType="decimal-pad"
                  value={newDuration}
                  onChangeText={setNewDuration}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sleep Quality</Text>
                <View style={styles.qualityRow}>
                  {(['Poor', 'Fair', 'Good', 'Excellent'] as const).map(
                    quality => (
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
                    ),
                  )}
                </View>
              </View>
            </ScrollView>

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
                onPress={handleAddEntry}
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
  quality: { fontSize: 14, color: '#8B5CF6', fontWeight: '700' },
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
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
