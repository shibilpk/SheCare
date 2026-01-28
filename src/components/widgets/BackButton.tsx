import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import FontelloIcon from '../../services/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/navigation';
const BackButton = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={styles.backBtn}
      onPress={() => navigation.goBack()}
    >
      <FontelloIcon name="left-open-mini" size={28} color="#333" />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  backBtn: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
