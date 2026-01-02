import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';

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
  const handleUpdate = () => {
    // Open app store or play store
    // You can replace these URLs with your actual app store links
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
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Header with Gradient */}
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <FontelloIcon name="download" size={48} color="#FFF" />
                </View>
                <Text style={styles.headerTitle}>Update Available</Text>
                <Text style={styles.headerSubtitle}>Version {version}</Text>
              </View>
            </LinearGradient>

            {/* Update Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>What's New</Text>
              {updateNotes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <View style={styles.bulletPoint}>
                    <FontelloIcon name="ok" size={12} color="#8B5CF6" />
                  </View>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>

            {/* Required Badge */}
            {isRequired && (
              <View style={styles.requiredBadge}>
                <FontelloIcon name="attention" size={16} color="#EF4444" />
                <Text style={styles.requiredText}>
                  This update is required to continue using the app
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                <Text style={styles.updateBtnText}>Update Now</Text>
                <FontelloIcon name="right-open-mini" size={20} color="#FFF" />
              </TouchableOpacity>

              {!isRequired && (
                <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                  <Text style={styles.skipBtnText}>Skip for Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  headerContainer: {
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  notesContainer: {
    padding: 24,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  requiredText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 24,
    paddingTop: 8,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  skipBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
});
