import React from 'react';
import { View, Text, FlatList, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import ModalTopIcon from './ModalTopIcon';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type NotificationItem = {
  id: number | string;
  title: string;
  message?: string;
  time?: string;
  icon: string;
  color: string;
  // Optional extra fields (for appointments, etc.)
  subtitleLeft?: string;
  subtitleRight?: string;
};

type NotificationsModalProps = {
  visible: boolean;
  title?: string;
  items: NotificationItem[];
  onClose: () => void;
};

export default function NotificationsModal({ visible, title = 'Notifications', items, onClose }: NotificationsModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <ModalTopIcon onPress={onClose} iconName="cancel" />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                <FontelloIcon name={item.icon} size={18} color={THEME_COLORS.textLight} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {!!item.time && <Text style={styles.rowTime}>{item.time}</Text>}
                </View>
                {item.message ? (
                  <Text style={styles.rowMsg}>{item.message}</Text>
                ) : (
                  <View style={styles.subtitleRow}>
                    {!!item.subtitleLeft && <Text style={styles.subtitleLeft}>{item.subtitleLeft}</Text>}
                    {!!item.subtitleRight && <Text style={styles.subtitleRight}>{item.subtitleRight}</Text>}
                  </View>
                )}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)'
  },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
    backgroundColor: THEME_COLORS.textLight,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: THEME_COLORS.text },
  row: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: THEME_COLORS.text },
  rowTime: { fontSize: 12, color: '#999' },
  rowMsg: { fontSize: 14, color: '#666' },
  subtitleRow: { flexDirection: 'row', gap: 12 },
  subtitleLeft: { fontSize: 13, color: '#666' },
  subtitleRight: { fontSize: 13, color: THEME_COLORS.primary, fontWeight: '600' },
});
