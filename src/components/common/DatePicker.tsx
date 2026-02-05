import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useIsDarkMode } from '@src/services/theme';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  format?: (date: Date) => string;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  containerStyle,
  labelStyle,
  buttonStyle,
  textStyle,
  format,
  disabled = false,
}: DatePickerProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const checkDarkMode = useIsDarkMode();

  const showPicker = () => {
    if (!disabled) {
      setPickerVisible(true);
    }
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hidePicker();
  };

  const formatDate = (date: Date): string => {
    if (format) {
      return format(date);
    }

    if (mode === 'time') {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (mode === 'datetime') {
      return date.toLocaleString();
    }

    return date.toLocaleDateString();
  };

  const getIcon = () => {
    if (mode === 'time') return 'clock';
    return 'calendar';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        onPress={showPicker}
        style={[styles.button, buttonStyle, disabled && styles.buttonDisabled]}
        disabled={disabled}
      >
        <Text style={[styles.text, textStyle, disabled && styles.textDisabled]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <FontelloIcon
          name={getIcon()}
          size={20}
          color={disabled ? '#ccc' : '#999'}
        />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        themeVariant={checkDarkMode ? 'dark' : 'light'}
        isDarkModeEnabled={checkDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  text: {
    fontSize: 15,
    color: '#333',
  },
  textDisabled: {
    color: '#999',
  },
});
