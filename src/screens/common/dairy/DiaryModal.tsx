import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ModalTopIcon from '../../../components/common/ModalTopIcon';
import { THEME_COLORS } from '../../../constants/colors';
import FontelloIcon from '../../../utils/FontelloIcons';

interface DiaryModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialText?: string;
  onSave?: (date: Date, text: string) => void;
}

const DiaryModal: React.FC<DiaryModalProps> = ({
  visible,
  onClose,
  initialDate,
  initialText = '',
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [diaryText, setDiaryText] = useState(initialText);
  const [diaryDate, setDiaryDate] = useState(initialDate || new Date());
  const [showDiaryDatePicker, setShowDiaryDatePicker] = useState(false);

  // Update state when props change
  useEffect(() => {
    if (visible) {
      setDiaryText(initialText);
      setDiaryDate(initialDate || new Date());
    }
  }, [visible, initialDate, initialText]);

  const handleSave = () => {
    if (onSave) {
      onSave(diaryDate, diaryText);
    }
    onClose();
  };

  const handleCancel = () => {
    setDiaryText(initialText);
    setDiaryDate(initialDate || new Date());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalContainer, { paddingTop: insets.top }]}
        keyboardVerticalOffset={24}
      >
        {/* Header */}

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ModalTopIcon iconName="cancel" onPress={handleCancel} />
            <TouchableOpacity onPress={() => setShowDiaryDatePicker(true)}>
              <View style={styles.dateBox}>
                <FontelloIcon
                  name="calendar"
                  size={16}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.headerDate}>
                  {diaryDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDiaryDatePicker}
              mode="date"
              date={diaryDate}
              onConfirm={date => {
                setDiaryDate(date);
                setShowDiaryDatePicker(false);
              }}
              onCancel={() => setShowDiaryDatePicker(false)}
            />
            <ModalTopIcon
              iconName="check"
              size={24}
              color={THEME_COLORS.primary}
              onPress={handleSave}
            />
          </View>
          {/* 👇 Scrollable content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Daily Notes</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={8}
                  value={diaryText}
                  onChangeText={setDiaryText}
                  placeholder="Write your thoughts, feelings, or any notes..."
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>💭</Text>
                <Text style={styles.tipText}>How are you feeling today?</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>📝</Text>
                <Text style={styles.tipText}>
                  Track your symptoms and moods
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>💡</Text>
                <Text style={styles.tipText}>
                  Note any activities or events
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
  flexGrow: 1,
  paddingBottom: 24,
},
  modalContainer: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBody: {
    flex: 1,
    paddingTop: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
    textAlignVertical: 'top',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  headerDate: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  tipsSection: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default DiaryModal;
