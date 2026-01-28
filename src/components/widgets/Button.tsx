import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: object;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      {isPrimary ? (
        <View style={styles.primaryBorder}>
          <LinearGradient
            colors={[THEME_COLORS.primary, THEME_COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <View style={styles.content}>
              {loading ? (
                <ActivityIndicator color={THEME_COLORS.textLight} />
              ) : (
                <Text style={[styles.text, styles.primaryText]}>{title}</Text>
              )}
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.secondaryButton}>
          {loading ? (
            <ActivityIndicator color={THEME_COLORS.primary} />
          ) : (
            <Text style={[styles.text, styles.secondaryText]}>{title}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  /* ✅ Primary button border */
  primaryBorder: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
    overflow: 'hidden',
  },

  gradient: {
    borderRadius: 8,
  },

  content: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Secondary */
  secondaryButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: THEME_COLORS.textLight,
  },
  secondaryText: {
    color: THEME_COLORS.primary,
  },
});

export default Button;
