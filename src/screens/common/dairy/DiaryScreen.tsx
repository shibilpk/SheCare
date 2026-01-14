import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../../utils/FontelloIcons';
import { THEME_COLORS } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../constants/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type DiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Diary'>;

const DiaryScreen: React.FC = () => {
  const navigation = useNavigation<DiaryScreenNavigationProp>();

  const [diaryText, setDiaryText] = useState('');
  const [diaryDate, setDiaryDate] = useState(new Date());
  const [showDiaryDatePicker, setShowDiaryDatePicker] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    const payload = {
      date: diaryDate,
      text: diaryText,
    };
    console.log('Diary saved:', payload);

    // You can add API call here
    // await saveDiary(payload);

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerBtn}>
            <FontelloIcon name="left-open-mini" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDiaryDatePicker(true)}>
            <View style={styles.dateBox}>
              <FontelloIcon name="calendar" size={16} color={THEME_COLORS.primary} />
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

          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <FontelloIcon name="check" size={24} color={THEME_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.labelRow}>
            <FontelloIcon name="edit" size={20} color={THEME_COLORS.primary} />
            <Text style={styles.label}>Daily Notes</Text>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              value={diaryText}
              onChangeText={setDiaryText}
              placeholder="Write your thoughts, feelings, or any notes about your day..."
              placeholderTextColor="#999"
              autoFocus
            />
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>💭</Text>
              <Text style={styles.tipText}>
                How are you feeling today?
              </Text>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME_COLORS.textLight,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtn: {
    padding: 4,
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
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
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

export default DiaryScreen;
