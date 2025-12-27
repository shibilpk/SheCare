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
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const safeAreaInsets = useSafeAreaInsets();

  const setToken = useStore((state) => state.setToken);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      // Simulate login and save token/refreshToken
      setToken('dummy_token_123', 'dummy_refresh_456');
      setLoading(false);
      resetForm();
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
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                error={errors.email}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
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
                onPress={() => Alert.alert('Navigate', 'Go to sign up screen')}
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
  socialLoginContainer: {
    marginTop: 10,
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

export default LoginScreen;
