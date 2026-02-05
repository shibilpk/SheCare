import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { THEME_COLORS } from '../../constants/colors';

interface NetworkErrorModalProps {
  visible: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
  visible,
  onRetry,
  isRetrying = false,
}) => {
  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      hardwareAccelerated={true}
    >
      <View style={styles.container}>
        <View style={styles.backdrop} />

        <View style={styles.modalContent}>
          {/* Vector Animation - Network Error */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('@src/animations/devices.json')}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          <Text style={styles.title}>No Internet Connection</Text>

          <Text style={styles.description}>
            Please check your network connection and try again. Make sure WiFi
            or mobile data is enabled.
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              isRetrying && styles.retryButtonDisabled,
            ]}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFF"
                  style={styles.spinner}
                />
                <Text style={styles.retryButtonText}>Retrying...</Text>
              </>
            ) : (
              <Text style={styles.retryButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            The app will automatically retry your last action when connection is
            restored.
          </Text>
        </View>
      </View>
    </Modal>
  );
};
const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  animationContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.text || '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.text || '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryCount: {
    fontSize: 12,
    color: THEME_COLORS.secondary || '#FF9800',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: THEME_COLORS.primary || '#E91E63',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  spinner: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: THEME_COLORS.text || '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NetworkErrorModal;
