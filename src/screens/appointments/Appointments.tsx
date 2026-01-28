import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { STYLE } from '../../constants/app';

const APPOINTMENTS = [
  {
    id: 1,
    title: 'Ultrasound Scan',
    date: 'Oct 10, 2025',
    time: '10:00 AM',
    doctor: 'Dr. Sarah Johnson',
    icon: 'stethoscope',
    color: '#8B5CF6',
  },
  {
    id: 2,
    title: 'Prenatal Check-up',
    date: 'Oct 17, 2025',
    time: '2:30 PM',
    doctor: 'Dr. Sarah Johnson',
    icon: 'heart',
    color: '#EC4899',
  },
  {
    id: 3,
    title: 'Blood Test',
    date: 'Oct 24, 2025',
    time: '9:00 AM',
    doctor: 'Lab Technician',
    icon: 'droplet',
    color: '#EF4444',
  },
];

export default function AppointmentsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={APPOINTMENTS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <FontelloIcon name={item.icon} size={20} color={THEME_COLORS.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.doctor}</Text>
              <View style={styles.bottomRow}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  headerBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.text },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh, marginTop: 14, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  title: { fontSize: 16, fontWeight: '600', color: THEME_COLORS.text, marginBottom: 4 },
  sub: { fontSize: 14, color: '#666', marginBottom: 6 },
  bottomRow: { flexDirection: 'row', gap: 12 },
  date: { fontSize: 13, color: '#999' },
  time: { fontSize: 13, color: THEME_COLORS.primary, fontWeight: '600' },
});
