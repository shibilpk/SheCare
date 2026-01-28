import React from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TextInputProps,
} from 'react-native';
import { THEME_COLORS } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string | string[];
}

const createErrorMessage = (error: string | string[]): React.ReactNode => {
  if (!error) return null;

  if (Array.isArray(error)) {
    return error.map((msg, index) => (
      <Text key={index} style={styles.errorText}>
        • {msg}
      </Text>
    ));
  }

  return <Text style={styles.errorText}>{error}</Text>;
};

const Input: React.FC<InputProps> = ({ label, error, style, ...rest }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...rest}
        style={[styles.input, error ? styles.inputError : null, style]}
        autoCapitalize="none"
      />

      {error && createErrorMessage(error)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: THEME_COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME_COLORS.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
