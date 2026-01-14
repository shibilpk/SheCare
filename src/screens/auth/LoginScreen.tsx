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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button } from '../../components';
import { TouchableOpacity } from 'react-native';
import apiClient, { APIError } from '../../utils/ApiClient';
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { AUTH_V1_URLS } from '../../constants/apis';

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const safeAreaInsets = useSafeAreaInsets();

  const setToken = useStore(state => state.setToken);

  const resetForm = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await apiClient.post<any>(
          AUTH_V1_URLS.LOGIN,
          formData,
          { is_auth: false }, // No auth needed for login
        );

        if (response.state === 1 && response.access && response.refresh) {
          // Store tokens and user data
          setToken(response.access, response.refresh);

          // Optionally store user data if needed
          // await AsyncStorage.setItem('user_data', JSON.stringify(response.user));

          resetForm();
          Alert.alert('Success', 'Login successful!');
        } else {
          Alert.alert('Error', 'Invalid response from server');
        }
      } catch (error) {
        const apiError = error as APIError;
        let errorMessage = apiError.message;

        if (apiError.statusCode === 401) {
          errorMessage = 'Invalid email or password';
        }
        Alert.alert('Login Failed', errorMessage);
      } finally {
        setLoading(false);
        setToken("fake", "fakeß");

      }
    }
  };

  return (
    <View style={styles.background}>
      {/* <Image
        source={{ uri: 'https://i.pinimg.com/736x/06/99/fa/0699fac320b02ff769e0fa0ad3fc725f.jpg' }}
        style={styles.absoluteBg}
        resizeMode="cover"
      /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: safeAreaInsets.top }]}
        keyboardVerticalOffset={24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Image
              source={require('../../assets/images/calendar-woman.png')}
              style={styles.calendarWoman}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>We are glad you are here</Text>
            <View style={styles.form}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                error={errors.email}
              />
              <Input
                label="Password"
                value={formData.password}
                onChangeText={text => setFormData({ ...formData, password: text })}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
              />
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
              />
              <Button
                title="Create Account"
                onPress={() => navigation.replace(SCREENS.REGISTER)}
                variant="secondary"
              />
            </View>
            {/* Social Login Buttons */}
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>Or sign in with</Text>
              <View style={styles.socialIconsRow}>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {}}
                >
                  <Image
                    source={require('../../assets/images/icons/icons8-google-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {}}
                >
                  <Image
                    source={require('../../assets/images/icons/icons8-github-50.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {}}
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
  //   absoluteBg: {
  //     position: 'absolute',
  //     top: 0,
  //     left: 0,
  //     width: '100%',
  //     height: '100%',
  //     zIndex: -1,
  // 	opacity: .7,
  //   },
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  socialLoginContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
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

export default LoginScreen;
