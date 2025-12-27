import { StyleSheet } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';

type ModalTopIconProps = {
  onPress: () => void;
  iconName: string;
};

const ModalTopIcon = ({ onPress, iconName }: ModalTopIconProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      accessibilityLabel="Close notification center"
    >
      <FontelloIcon
        name={iconName}
        size={22}
        style={styles.modalHeaderBtnIcon}
        color={THEME_COLORS.primary}
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
  modalHeaderBtnIcon: {
    fontSize: 27,
    color: THEME_COLORS.text,
  },
});
