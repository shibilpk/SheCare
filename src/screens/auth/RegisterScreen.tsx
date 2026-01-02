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
import { Input, Button } from '../../components';
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';

const RegisterScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const safeAreaInsets = useSafeAreaInsets();
  const setToken = useStore(state => state.setToken);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setZipCode('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);

      // Prepare registration data
      const registrationData = {
        firstName,
        lastName,
        email,
        password,
        address,
        city,
        state,
        country,
        zipCode,
      };

      // Simulate API call
      // In production, you would send this data to your backend
      console.log('Registration data:', registrationData);

      // Simulate success and auto-login
      setToken('dummy_token_123', 'dummy_refresh_456');
      setLoading(false);
      resetForm();
      Alert.alert('Success', 'Account created successfully!');
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
              source={require('../../assets/images/calendar-woman.png')}
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
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                error={errors.firstName}
              />

              <Input
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name (optional)"
              />

              <Input
                label="Email *"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password *"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              {/* Optional Address Fields */}
              <Text style={styles.sectionTitle}>Address (Optional)</Text>

              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="City"
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="State"
                    value={state}
                    onChangeText={setState}
                    placeholder="State"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Country"
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Country"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Zip Code"
                    value={zipCode}
                    onChangeText={setZipCode}
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
                    source={require('../../assets/images/icons/icons8-google-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => Alert.alert('GitHub', 'GitHub sign up')}
                >
                  <Image
                    source={require('../../assets/images/icons/icons8-github-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => Alert.alert('Instagram', 'Instagram sign up')}
                >
                  <Image
                    source={require('../../assets/images/icons/icons8-instagram-50.png')}
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
    backgroundColor: THEME_COLORS.background,
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
    color: THEME_COLORS.dark,
  },
  subtitle: {
    fontSize: 16,
    color: THEME_COLORS.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.dark,
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
    color: THEME_COLORS.gray,
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
});

export default RegisterScreen;
