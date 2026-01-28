import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button } from '@src/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '@src/constants/navigation';
import { APIS } from '@src/constants/apis';
import apiClient, { APIError } from '@src/services/ApiClient';
import { STYLE } from '@src/constants/app';
import {
  parseValidationErrors,
  FormErrors,
  clearFieldError,
  validateRequiredFields,
  validateEmail,
} from '@src/utils/formUtils';
import { useToastMessage } from '@src/utils/toastMessage';



// Types for registration
type RegistrationData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
};

type RegistrationErrors = FormErrors<RegistrationData & { confirmPassword: string }>;

const RegisterScreen: React.FC = () => {
  const [registrationData, setRegistrationData] = useState<RegistrationData & { confirmPassword: string }>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});

  const safeAreaInsets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToastMessage();


  const resetForm = () => {
    setRegistrationData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
    });
    setErrors({});
  };

  const handleChange = (field: keyof (RegistrationData & { confirmPassword: string }), value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => clearFieldError(prev, field));
  };

  const validateForm = (): boolean => {
    let newErrors: RegistrationErrors = {};

    // Required fields
    newErrors = {
      ...newErrors,
      ...validateRequiredFields(registrationData, ['first_name', 'email', 'password', 'confirmPassword']),
    };

    // Email validation
    if (!newErrors.email) {
      const emailError = validateEmail(registrationData.email);
      if (emailError) newErrors.email = emailError;
    }

    // Password length
    if (!newErrors.password && registrationData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password match
    if (!newErrors.confirmPassword && registrationData.password !== registrationData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Prepare registration data (exclude confirmPassword)
    const { confirmPassword, ...apiData } = registrationData;

    try {
      const response = await apiClient.post<any>(
        APIS.V1.CUSTOMER.REGISTER,
        apiData,
        { is_auth: false },
      );

      resetForm();
      const userId = response.user_id;
      navigation.navigate(SCREENS.OTP_VERIFICATION, { id: userId });
      if (response.detail?.message) {
        showToast(response.detail.message);
      }
    } catch (error) {
      const apiError = error as APIError;

      if (apiError.statusCode === 422 && apiError.data) {
        setErrors(parseValidationErrors(apiError.data));
        showToast('Validation Error', { type: 'danger', duration: 1000 });
      } else {
        Alert.alert(
          apiError.normalizedError.title,
          apiError.normalizedError.message,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: safeAreaInsets.top }]}
        keyboardVerticalOffset={24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <Image
              source={require('@src/assets/images/calendar-woman.png')}
              style={styles.calendarWoman}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and get started</Text>

            <View style={styles.form}>
              {/* Required Fields */}
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <Input
                label="First Name *"
                value={registrationData.first_name}
                onChangeText={text => handleChange('first_name', text)}
                placeholder="Enter your first name"
                error={errors.first_name}
              />

              <Input
                label="Last Name"
                value={registrationData.last_name}
                onChangeText={text => handleChange('last_name', text)}
                placeholder="Enter your last name (optional)"
              />

              <Input
                label="Email *"
                value={registrationData.email}
                onChangeText={text => handleChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password *"
                value={registrationData.password}
                onChangeText={text => handleChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label="Confirm Password *"
                value={registrationData.confirmPassword}
                onChangeText={text => handleChange('confirmPassword', text)}
                placeholder="Re-enter your password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              {/* Optional Address Fields */}
              <Text style={styles.sectionTitle}>Address (Optional)</Text>

              <Input
                label="Address"
                value={registrationData.address}
                onChangeText={text => handleChange('address', text)}
                placeholder="Enter your address"
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="City"
                    value={registrationData.city}
                    onChangeText={text => handleChange('city', text)}
                    placeholder="City"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="State"
                    value={registrationData.state}
                    onChangeText={text => handleChange('state', text)}
                    placeholder="State"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Country"
                    value={registrationData.country}
                    onChangeText={text => handleChange('country', text)}
                    placeholder="Country"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Zip Code"
                    value={registrationData.zip_code}
                    onChangeText={text => handleChange('zip_code', text)}
                    placeholder="Zip Code"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.createAccountButton}
              />

              <Button
                title="Already have an account? Sign In"
                onPress={() => navigation.replace(SCREENS.LOGIN)}
                variant="secondary"
              />
            </View>

            {/* Social Registration */}
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>Or sign up with</Text>
              <View style={styles.socialIconsRow}>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => Alert.alert('Google', 'Google sign up')}
                >
                  <Image
                    source={require('@src/assets/images/icons/icons8-google-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => Alert.alert('GitHub', 'GitHub sign up')}
                >
                  <Image
                    source={require('@src/assets/images/icons/icons8-github-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => Alert.alert('Instagram', 'Instagram sign up')}
                >
                  <Image
                    source={require('@src/assets/images/icons/icons8-instagram-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  socialLoginContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  socialIconButton: {
    borderRadius: 24,
    padding: 10,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  calendarWoman: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  createAccountButton: {
    marginBottom: STYLE.spacing.mh,
  },
});

export default RegisterScreen;
