import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { BASE_URL, APIS } from '@src/constants/apis';

interface FireworksProps {
  readonly visible: boolean;
  readonly onComplete?: () => void;
  readonly duration?: number;
}

export default function Fireworks({
  visible,
  onComplete,
  duration = 3000,
}: FireworksProps) {
  const animationRef = useRef<LottieView>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);

  // Fetch animation from backend
  useEffect(() => {
    const animationEndpoint = APIS.v1.general.animation('fireworks');
    const fullUrl = `${BASE_URL}${animationEndpoint}`;
    setAnimationUrl(fullUrl);
  }, []);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();

      // Auto hide after duration
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onComplete]);

  if (!visible || !animationUrl) return null;

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={{ uri: animationUrl }}
        style={styles.animation}
        loop={false}
        autoPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  animation: {
    width: '120%',
    height: '120%',
    position: 'absolute',
  },
});
