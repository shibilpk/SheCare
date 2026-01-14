import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAvoidingModal } from '..';

export type FormType = 'input' | 'yesno' | 'datepicker' | 'none';

export interface PopupScreen {
  id: string;
  image?: any;
  imageUrl?: string;
  icon?: string;
  title: string;
  message: string;
  formType?: FormType;
  inputPlaceholder?: string;
  inputKeyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  buttonText?: string;
  allowSkip?: boolean;
  skipButtonText?: string;
}

interface PopupWizardProps {
  visible: boolean;
  screens: PopupScreen[];
  onComplete: (data: Record<string, any>) => void;
  onSkip?: () => void;
  gradientColors?: string[];
}

export default function PopupWizard({
  visible,
  screens,
  onComplete,
  onSkip: _onSkip,
  gradientColors = [THEME_COLORS.primary, THEME_COLORS.secondary],
}: PopupWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentScreen = screens[currentIndex];
  const isLastScreen = currentIndex === screens.length - 1;

  const handleNext = () => {
    const updatedData = { ...formData };

    if (currentScreen.formType === 'input' && inputValue.trim()) {
      updatedData[currentScreen.id] = inputValue;
    } else if (currentScreen.formType === 'datepicker') {
      updatedData[currentScreen.id] = dateValue.toISOString();
    }

    setFormData(updatedData);

    if (isLastScreen) {
      onComplete(updatedData);
      resetWizard();
    } else {
      setCurrentIndex(currentIndex + 1);
      setInputValue('');
    }
  };

  const handleYesNo = (value: boolean) => {
    const updatedData = { ...formData, [currentScreen.id]: value };
    setFormData(updatedData);

    if (isLastScreen) {
      onComplete(updatedData);
      resetWizard();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (isLastScreen) {
      onComplete(formData);
      resetWizard();
    } else {
      setCurrentIndex(currentIndex + 1);
      setInputValue('');
    }
  };

  const resetWizard = () => {
    setCurrentIndex(0);
    setFormData({});
    setInputValue('');
    setDateValue(new Date());
  };

  const renderFormElement = () => {
    switch (currentScreen.formType) {
      case 'input':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputCard}>
              <View style={styles.inputIconBox}>
                <FontelloIcon
                  name="edit"
                  size={20}
                  color={THEME_COLORS.primary}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder={currentScreen.inputPlaceholder || 'Enter value...'}
                placeholderTextColor="#9CA3AF"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={currentScreen.inputKeyboardType || 'default'}
              />
            </View>
          </View>
        );

      case 'yesno':
        return (
          <View style={styles.formContainer}>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={styles.yesButton}
                onPress={() => handleYesNo(true)}
                activeOpacity={0.85}
              >
                <View style={styles.yesNoCard}>
                  <View style={styles.yesIconCircle}>
                    <FontelloIcon name="ok" size={32} color="#10B981" />
                  </View>
                  <Text style={styles.yesNoLabel}>Yes</Text>
                  <Text style={styles.yesNoSubtext}>I would like this</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.noButton}
                onPress={() => handleYesNo(false)}
                activeOpacity={0.85}
              >
                <View style={styles.yesNoCard}>
                  <View style={styles.noIconCircle}>
                    <FontelloIcon name="cancel" size={32} color="#EF4444" />
                  </View>
                  <Text style={styles.yesNoLabel}>No</Text>
                  <Text style={styles.yesNoSubtext}>Maybe later</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'datepicker':
        return (
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateIconBox}>
                <FontelloIcon
                  name="calendar"
                  size={24}
                  color={THEME_COLORS.primary}
                />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Selected Date</Text>
                <Text style={styles.dateValue}>
                  {dateValue.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <FontelloIcon name="right-open-mini" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showDatePicker}
              date={dateValue}
              mode="date"
              onConfirm={date => {
                setShowDatePicker(false);
                setDateValue(date);
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const renderImage = () => {
    if (currentScreen.image) {
      return (
        <View style={styles.imageContainer}>
          <View style={styles.imageOuterGlow}>
            <View style={styles.imageInnerRing}>
              <Image source={currentScreen.image} style={styles.image} />
            </View>
          </View>
        </View>
      );
    } else if (currentScreen.imageUrl) {
      return (
        <View style={styles.imageContainer}>
          <View style={styles.imageOuterGlow}>
            <View style={styles.imageInnerRing}>
              <Image
                source={{ uri: currentScreen.imageUrl }}
                style={styles.image}
              />
            </View>
          </View>
        </View>
      );
    } else if (currentScreen.icon) {
      return (
        <View style={styles.iconContainer}>
          <View style={styles.iconOuterGlow}>
            <View style={styles.iconInnerCircle}>
              <FontelloIcon name={currentScreen.icon} size={64} color="#FFF" />
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  if (!currentScreen) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Gradient Header */}
            <LinearGradient
              colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.headerGradient}>
                <View style={styles.headerContent}>
                  {renderImage()}
                  <Text style={styles.headerTitle}>{currentScreen.title}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* White Content Card */}
            <View style={styles.contentCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Progress Indicator */}
                {screens.length > 1 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBarContainer}>
                      {screens.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.progressDot,
                            index <= currentIndex && styles.progressDotActive,
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.progressLabel}>
                      Step {currentIndex + 1} of {screens.length}
                    </Text>
                  </View>
                )}

                {/* Message Section */}
                <View style={styles.messageSection}>
                  <Text style={styles.messageText}>
                    {currentScreen.message}
                  </Text>
                </View>

                {/* Form Element */}
                {renderFormElement()}

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                  {currentScreen.formType !== 'yesno' && (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleNext}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <View style={styles.primaryButtonGradient}>
                          <Text style={styles.primaryButtonText}>
                            {currentScreen.buttonText ||
                              (isLastScreen ? '✓ Complete' : 'Continue')}
                          </Text>
                          <View style={styles.buttonIconCircle}>
                            <FontelloIcon
                              name={isLastScreen ? 'ok' : 'right-open-mini'}
                              size={20}
                              color="#FFF"
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {currentScreen.allowSkip && (
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={handleSkip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.skipButtonText}>
                        {currentScreen.skipButtonText || 'Skip for now'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '94%',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 32,
    paddingBottom: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageOuterGlow: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  imageInnerRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  image: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconOuterGlow: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconInnerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  progressSection: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: THEME_COLORS.primary,
    width: 32,
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  messageSection: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  messageText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  yesButton: {
    flex: 1,
  },
  noButton: {
    flex: 1,
  },
  yesNoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  yesIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#D1FAE5',
  },
  noIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  yesNoLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  yesNoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dateIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f0e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginTop: 'auto',
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  buttonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },
  keyboardAvoidView: {
    flex: 1,
  },
});
