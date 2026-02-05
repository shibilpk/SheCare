import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import FontelloIcon from '../../services/FontelloIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type AdSize = 'banner' | 'fullpage' | 'halfpage';

export interface AdData {
  id: string;
  imageUrl: string;
  link?: string;
  size: AdSize;
  title?: string;
}

interface AdBannerProps {
  ads: AdData[];
  size?: AdSize;
  autoRotate?: boolean;
  rotationInterval?: number; // in milliseconds
  onAdClick?: (ad: AdData) => void;
  containerStyle?: any;
  showCloseButton?: boolean;
}

export default function AdBanner({
  ads,
  size = 'banner',
  autoRotate = true,
  rotationInterval = 5000,
  onAdClick,
  containerStyle,
  showCloseButton = false,
}: AdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [closedAds, setClosedAds] = useState<Set<string>>(new Set());

  // Filter ads by size and exclude closed ads
  const filteredAds = ads.filter(ad => ad.size === size && !closedAds.has(ad.id));

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentAdIndex >= filteredAds.length && filteredAds.length > 0) {
      setCurrentAdIndex(0);
    }
  }, [filteredAds.length, currentAdIndex]);

  // Auto-rotation logic
  useEffect(() => {
    if (!autoRotate || filteredAds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % filteredAds.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, filteredAds.length, rotationInterval]);

  if (filteredAds.length === 0) return null;

  const currentAd = filteredAds[currentAdIndex];

  // Safety check: if currentAd is undefined, don't render
  if (!currentAd) return null;

  const handleAdPress = () => {
    if (onAdClick) {
      onAdClick(currentAd);
    }

    if (currentAd.link) {
      Linking.canOpenURL(currentAd.link).then(supported => {
        if (supported) {
          Linking.openURL(currentAd.link!);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      });
    }
  };

  const handleClose = () => {
    setClosedAds(prev => new Set(prev).add(currentAd.id));
  };

  // Render Banner Ad
  if (size === 'banner') {
    return (
      <View style={[styles.bannerContainer, containerStyle]}>
        <TouchableOpacity onPress={handleAdPress} activeOpacity={0.8}>
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {showCloseButton && (
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <FontelloIcon name="cancel" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {filteredAds.length > 1 && (
          <View style={styles.pagination}>
            {filteredAds.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentAdIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Render Half Page Ad
  if (size === 'halfpage') {
    return (
      <View style={[styles.halfPageContainer, containerStyle]}>
        <TouchableOpacity onPress={handleAdPress} activeOpacity={0.8}>
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={styles.halfPageImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeButtonHalf}
            onPress={handleClose}
          >
            <FontelloIcon name="cancel" size={24} color="#666" />
          </TouchableOpacity>
        )}

        {filteredAds.length > 1 && (
          <View style={styles.paginationHalf}>
            {filteredAds.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentAdIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Render Full Page Ad (Modal)
  if (size === 'fullpage') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.fullPageContainer}>
          <TouchableOpacity
            style={styles.fullPageOverlay}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View style={styles.fullPageContent}>
            <TouchableOpacity onPress={handleAdPress} activeOpacity={0.9}>
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.fullPageImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButtonFull}
              onPress={handleClose}
            >
              <FontelloIcon name="cancel" size={32} color="#666" />
            </TouchableOpacity>

            {filteredAds.length > 1 && (
              <View style={styles.paginationFull}>
                {filteredAds.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      styles.paginationDotWhite,
                      index === currentAdIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}
const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
const styles = StyleSheet.create({
  // Banner Ad Styles
  bannerContainer: {
    height: 48,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 8,
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  paginationDotWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Half Page Ad Styles
  halfPageContainer: {
    height: 250,
    marginVertical: 12,
    position: 'relative',
    // borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  halfPageImage: {
    width: '100%',
    height: '100%',
  },
  closeButtonHalf: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationHalf: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  // Full Page Ad Styles
  fullPageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fullPageContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    position: 'relative',
  },
  fullPageImage: {
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 12,
  },
  closeButtonFull: {
    position: 'absolute',
    top: -50,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationFull: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
});
