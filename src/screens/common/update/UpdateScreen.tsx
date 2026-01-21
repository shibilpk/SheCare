import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
  Animated,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../utils/FontelloIcons';
import { THEME_COLORS } from '../../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UpdateScreenProps {
  visible: boolean;
  onSkip: () => void;
  onUpdate: () => void;
  version?: string;
  updateNotes?: string[];
  isRequired?: boolean;
}

export default function UpdateScreen({
  visible,
  onSkip,
  onUpdate,
  version = '2.0.0',
  updateNotes = [
    'Improved sleep tracking features',
    'New health insights dashboard',
    'Bug fixes and performance improvements',
    'Enhanced medication reminders',
  ],
  isRequired = false,
}: UpdateScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (visible) {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [visible, scaleAnim, pulseAnim, floatAnim]);

  const handleUpdate = () => {
    const storeURL =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/your-app-id'
        : 'https://play.google.com/store/apps/details?id=your.app.id';

    Linking.openURL(storeURL).catch(err =>
      console.error('Failed to open store:', err),
    );
    onUpdate();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={isRequired ? undefined : onSkip}
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={[styles.container, { paddingBottom: insets.bottom }]}
          edges={['top', 'bottom']}
        >
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Hero Image Section with Floating Animation */}
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['#ff9aa2', '#fcbcb9', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                {/* Animated Background Shapes */}
                <View style={styles.shapesContainer}>
                  <View style={[styles.shape, styles.shape1]} />
                  <View style={[styles.shape, styles.shape2]} />
                  <View style={[styles.shape, styles.shape3]} />
                </View>

                {/* Main Illustration/Image */}
                <Animated.View
                  style={[
                    styles.imageContainer,
                    { transform: [{ translateY: floatAnim }] },
                  ]}
                >
                  {/* You can replace this with an actual Image component */}
                  {/* <Image source={require('./path/to/update-illustration.png')} style={styles.heroImage} /> */}

                  {/* Fallback: Animated Icon */}
                  <Animated.View
                    style={[
                      styles.iconGlow,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                  <View style={styles.mainIconContainer}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F3F4F6']}
                      style={styles.iconGradient}
                    >
                      <FontelloIcon name="rocket" size={50} color="#8B5CF6" />
                    </LinearGradient>
                  </View>
                </Animated.View>

                {/* Version Badge */}
                <View style={styles.versionBadge}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  >
                    <View style={styles.versionBadgeGradient}>
                      <FontelloIcon name="star" size={14} color="#FFF" />
                      <Text style={styles.versionText}>v{version}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </View>

            {/* Content Section */}
            <View style={styles.bodySection}>
              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>🎉 Exciting Update!</Text>
                <Text style={styles.subtitle}>
                  We've made your app even better
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleUpdate}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#f8909c', '#FF6B9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    <View style={styles.buttonContent}>
                      <FontelloIcon
                        name="download-cloud"
                        size={24}
                        color="#FFF"
                      />
                      <Text style={styles.primaryButtonText}>Update Now</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {!isRequired && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSkip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{ maxHeight: Dimensions.get('window').height - 540 }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Features Grid */}
                  <View style={[styles.featuresSection]}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconWrapper}>
                        <FontelloIcon
                          name="sparkles"
                          size={18}
                          color="#8B5CF6"
                        />
                      </View>
                      <Text style={styles.sectionTitle}>What's New</Text>
                    </View>

                    <View style={styles.featuresGrid}>
                      {updateNotes.map((note, index) => {
                        const colors = [
                          '#EC4899',
                          '#8B5CF6',
                          '#06B6D4',
                          '#F59E0B',
                        ];
                        return (
                          <View key={index} style={styles.featureCard}>
                            <View
                              style={[
                                styles.featureIcon,
                                { backgroundColor: `${colors[index % 4]}20` },
                              ]}
                            />
                            <Text style={styles.featureText}>{note}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    height: '100%',
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 20,
  },

  // Hero Section
  heroSection: {
    height: 220,
    position: 'relative',
  },
  heroGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shapesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  shape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.15,
  },
  shape1: {
    width: 150,
    height: 150,
    backgroundColor: '#FFF',
    top: -50,
    right: -40,
  },
  shape2: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF',
    bottom: 30,
    left: -30,
  },
  shape3: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    top: 80,
    left: 40,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  versionBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Body Section
  bodySection: {
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Features Section
  featuresSection: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  featuresGrid: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureIcon: {
    width: 15,
    height: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 19,
  },

  // Actions Section
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },

  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
