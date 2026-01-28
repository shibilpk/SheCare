import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../services/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../constants/navigation';
import { THEME_COLORS } from '../../../constants/colors';
import useStore from '../../../hooks/useStore';
import { useIsDarkMode, isUserSetTheme } from '../../../services/theme';
import { STYLE } from '../../../constants/app';

type ThemeMode = 'light' | 'dark' | 'system';

const ThemeSettingsScreen: React.FC = () => {
  const systemTheme = useColorScheme();
  const checkUserSetTheme = isUserSetTheme();
  const setDarkMode = useStore(state => state.setDarkMode);

  const checkDarkMode = useIsDarkMode();

  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(
    !checkUserSetTheme ? 'system' : checkDarkMode ? 'dark' : 'light',
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleThemeSelect = (mode: ThemeMode) => {
    setSelectedTheme(mode);
    if (mode === 'system') {
      setDarkMode(undefined);
    } else {
      setDarkMode(mode === 'dark');
    }
  };

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: 'sun' },
    { mode: 'dark', label: 'Dark', icon: 'moon' },
    { mode: 'system', label: 'System', icon: 'mobile' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Description */}
      <View style={styles.descriptionBox}>
        <FontelloIcon name="palette" size={22} color={THEME_COLORS.primary} />
        <Text style={styles.descriptionText}>
          Choose your preferred theme. Changes will be applied immediately
          across the app.
        </Text>
      </View>

      {/* Theme Switch Buttons */}
      <View style={styles.toggleContainer}>
        {options.map(opt => {
          const isActive = selectedTheme === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[
                styles.toggleButton,
                isActive && styles.toggleButtonActive,
              ]}
              onPress={() => handleThemeSelect(opt.mode)}
              activeOpacity={0.8}
            >
              <FontelloIcon
                name={opt.icon}
                size={20}
                color={isActive ? '#fff' : '#555'}
              />
              <Text
                style={[styles.toggleText, isActive && styles.toggleTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preview */}
      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View
          style={[
            styles.previewArea,
            {
              backgroundColor:
                selectedTheme === 'dark'
                  ? '#1A1A1A'
                  : selectedTheme === 'light'
                  ? '#FFFFFF'
                  : systemTheme === 'dark'
                  ? '#1A1A1A'
                  : '#FFFFFF',
            },
          ]}
        >
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor:
                  selectedTheme === 'dark'
                    ? '#2D2D2D'
                    : selectedTheme === 'light'
                    ? '#F8F9FA'
                    : systemTheme === 'dark'
                    ? '#2D2D2D'
                    : '#F8F9FA',
              },
            ]}
          />
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <FontelloIcon name="info-circled" size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About System Default</Text>
            <Text style={styles.infoText}>
              Automatically switches between light and dark modes based on your
              device settings.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <FontelloIcon name="lightbulb" size={20} color="#FF9800" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Battery Saving</Text>
            <Text style={styles.infoText}>
              Dark mode helps save battery on OLED and AMOLED displays.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  descriptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  descriptionText: {
    flex: 1,
    color: '#1976D2',
    fontSize: 13,
    lineHeight: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  toggleText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  previewBox: {
    marginTop: 30,
    marginHorizontal: STYLE.spacing.mh,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  previewArea: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
  },
  previewCard: {
    width: '80%',
    height: 60,
    borderRadius: 10,
  },
  infoSection: {
    marginTop: 30,
    marginHorizontal: STYLE.spacing.mh,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    gap: 12,
    elevation: 1,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default ThemeSettingsScreen;
