import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { THEME_COLORS } from '../../constants/colors';
import { STYLE } from '../../constants/app';
import apiClient, { APIError } from '../../services/ApiClient';
import { APIS } from '../../constants/apis';
import { StaticContent as StaticContentType } from '../../types/staticContent';
import FontelloIcon from '../../services/FontelloIcons';
import EditorJsRenderer from '../../components/common/EditorJsRenderer';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREENS.STATIC_CONTENT
>;

interface StaticContentScreenProps {
  contentType: 'privacy-policy' | 'terms-of-service' | 'help-support';
  title: string;
}

const StaticContentScreen: React.FC<StaticContentScreenProps> = ({
  contentType,
  title,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const [content, setContent] = useState<StaticContentType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<StaticContentType>(
        APIS.v1.staticContent.content(contentType),
      );
      setContent(response);
    } catch (error) {
      if (error instanceof APIError) {
        console.error('Error fetching static content:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {content?.content && (
            <EditorJsRenderer data={content.content} />
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME_COLORS.textGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
});

// Export wrapped components
export const PrivacyPolicyScreen = () => (
  <StaticContentScreen contentType="privacy-policy" title="Privacy Policy" />
);

export const TermsOfServiceScreen = () => (
  <StaticContentScreen
    contentType="terms-of-service"
    title="Terms of Service"
  />
);

export const HelpSupportScreen = () => (
  <StaticContentScreen contentType="help-support" title="Help & Support" />
);

export default StaticContentScreen;
