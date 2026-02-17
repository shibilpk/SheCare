import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../services/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../constants/navigation';
import { THEME_COLORS } from '../../../constants/colors';
import apiClient, { APIError } from '../../../services/ApiClient';
import { APIS } from '../../../constants/apis';
import { useToastMessage } from '@src/utils/toastMessage';

interface LanguageOption {
  value: string;
  label: string;
}

interface TimezoneOption {
  value: string;
  label: string;
}

const PreferencesScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToastMessage();

  const [language, setLanguage] = useState<string>('en');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
  const [originalLanguage, setOriginalLanguage] = useState<string>('en');
  const [originalTimezone, setOriginalTimezone] = useState<string>('Asia/Kolkata');
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [timezoneOptions, setTimezoneOptions] = useState<TimezoneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(APIS.V1.CUSTOMER.PROFILE);
      if (response.profile) {
        const lang = response.profile.language || 'en';
        const tz = response.profile.timezone || 'Asia/Kolkata';
        setLanguage(lang);
        setTimezone(tz);
        setOriginalLanguage(lang);
        setOriginalTimezone(tz);
      }
    } catch (error) {
      const apiError = error as APIError;
      showToast(apiError.message, { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferencesOptions = async () => {
    try {
      const response = await apiClient.get<any>(
        APIS.V1.CUSTOMER.PREFERENCES_OPTIONS,
      );
      if (response) {
        setLanguageOptions(response.languages || []);
        setTimezoneOptions(response.timezones || []);
      }
    } catch (error) {
      console.info('Failed to fetch preference options:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      await fetchPreferencesOptions();
    };
    loadData();
  }, []);

  const hasChanges = () => {
    return language !== originalLanguage || timezone !== originalTimezone;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.patch<any>(
        APIS.V1.CUSTOMER.PREFERENCES,
        {
          language,
          timezone,
        },
      );

      if (response.profile) {
        setOriginalLanguage(language);
        setOriginalTimezone(timezone);
        showToast('Preferences updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      const apiError = error as APIError;
      showToast(apiError.message, { type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <FontelloIcon name="left-open-mini" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionBox}>
          <FontelloIcon name="cog-b" size={22} color={THEME_COLORS.primary} />
          <Text style={styles.descriptionText}>
            Customize your language and timezone preferences. Changes will be
            saved when you tap the save button.
          </Text>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontelloIcon name="language" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Language</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select your preferred language for the app interface
          </Text>

          <View style={styles.optionsContainer}>
            {languageOptions.map(option => {
              const isSelected = language === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => setLanguage(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioContainer}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[
                        styles.radioText,
                        isSelected && styles.radioTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Timezone Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontelloIcon name="clock" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Timezone</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select your timezone for accurate time-based features
          </Text>

          <View style={styles.optionsContainer}>
            {timezoneOptions.map(option => {
              const isSelected = timezone === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => setTimezone(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioContainer}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[
                        styles.radioText,
                        isSelected && styles.radioTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Info Note */}
        {hasChanges() && (
          <View style={styles.infoCard}>
            <FontelloIcon name="info-circled" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              You have unsaved changes. Don't forget to save before leaving.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges() || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontelloIcon name="floppy" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {hasChanges() ? 'Save Changes' : 'No Changes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 26,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  radioOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: THEME_COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.primary,
  },
  radioText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  radioTextSelected: {
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PreferencesScreen;
