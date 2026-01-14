import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';

type ModalTopIconProps = {
  onPress: () => void;
  iconName: string;
  size?: number;
  color?: string;
};

const ModalTopIcon = ({
  onPress,
  iconName,
  size = 22,
  color = THEME_COLORS.primary,
}: ModalTopIconProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      accessibilityLabel="Close notification center"
    >
      <FontelloIcon
        name={iconName}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};

export default ModalTopIcon;

const styles = StyleSheet.create({
  touchable: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
