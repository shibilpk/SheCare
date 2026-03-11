import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { THEME_COLORS } from '../../constants/colors';
import { STYLE } from '../../constants/app';
import apiClient, { APIError } from '../../services/ApiClient';
import { APIS } from '../../constants/apis';
import FontelloIcon from '../../services/FontelloIcons';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREENS.FEEDBACK
>;

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'general', label: 'General Feedback' },
];

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    feedback_type: 'general',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await apiClient.post(APIS.V1.CONTACT_FEEDBACK.submitFeedback(), formData);

      Alert.alert(
        'Success',
        'Thank you for your feedback! We appreciate your input.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                rating: 0,
                feedback_type: 'general',
                message: '',
              });
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      if (error instanceof APIError) {
        Alert.alert('Error', error.message || 'Failed to submit. Please try again.');
      }
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.description}>
            Your feedback helps us improve! Please share your thoughts, suggestions, or report any issues.
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor={THEME_COLORS.textGray}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={THEME_COLORS.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Rating */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating *</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleInputChange('rating', star)}
                  style={styles.starBtn}
                >
                  <Text style={[
                    styles.starText,
                    formData.rating >= star && styles.starTextActive
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
              {formData.rating > 0 && (
                <Text style={styles.ratingLabel}>
                  {formData.rating === 1 && 'Poor'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 4 && 'Very Good'}
                  {formData.rating === 5 && 'Excellent'}
                </Text>
              )}
            </View>
          </View>

          {/* Feedback Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Feedback Type *</Text>
            <View style={styles.typeContainer}>
              {FEEDBACK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => handleInputChange('feedback_type', type.value)}
                  style={[
                    styles.typeBtn,
                    formData.feedback_type === type.value && styles.typeBtnActive
                  ]}
                >
                  <Text style={[
                    styles.typeText,
                    formData.feedback_type === type.value && styles.typeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Feedback *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              placeholder="Share your thoughts..."
              placeholderTextColor={THEME_COLORS.textGray}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
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
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME_COLORS.textGray,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBtn: {
    marginRight: 8,
  },
  starText: {
    fontSize: 32,
    color: '#D1D5DB',
  },
  starTextActive: {
    color: '#FBBF24',
  },
  ratingLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    marginBottom: 8,
  },
  typeBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  typeText: {
    fontSize: 13,
    color: THEME_COLORS.text,
  },
  typeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default FeedbackScreen;
