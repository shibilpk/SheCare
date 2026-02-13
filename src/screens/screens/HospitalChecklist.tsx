import React, { useState } from 'react';
import { TextInput } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';

const initialCategories = [
  {
    id: 'mom',
    label: "Mom's Essentials",
    icon: 'user',
    color: '#FF6B6B',
    items: [
      { id: 1, label: 'Maternity Clothes', checked: false },
      { id: 2, label: 'Toiletries', checked: false },
      { id: 7, label: 'Insurance Papers', checked: false },
      { id: 8, label: 'Birth Plan', checked: false },
      { id: 9, label: 'Nursing Bra', checked: false },
    ],
  },
  {
    id: 'baby',
    label: "Baby's Essentials",
    icon: 'baby',
    color: '#4ECDC4',
    items: [
      { id: 3, label: 'Baby Clothes', checked: false },
      { id: 4, label: 'Diapers', checked: false },
      { id: 10, label: 'Blanket', checked: false },
    ],
  },
  {
    id: 'other',
    label: 'Other Items',
    icon: 'suitcase',
    color: '#45B7D1',
    items: [
      { id: 5, label: 'Phone Charger', checked: false },
      { id: 6, label: 'Snacks', checked: false },
      { id: 11, label: 'Pillow', checked: false },
    ],
  },
];

export default function HospitalChecklistScreen() {
  // ...existing code...
  const deleteOtherItem = (itemId: number) => {
    setCategories(cats =>
      cats.map(cat =>
        cat.id === 'other'
          ? {
              ...cat,
              items: cat.items.filter(item => item.id !== itemId),
            }
          : cat
      )
    );
  };
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState(initialCategories);
  const [newOtherItem, setNewOtherItem] = useState('');
  const addOtherItem = () => {
    if (!newOtherItem.trim()) return;
    setCategories(cats =>
      cats.map(cat =>
        cat.id === 'other'
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: Math.max(0, ...cat.items.map(i => i.id)) + 1,
                  label: newOtherItem.trim(),
                  checked: false,
                },
              ],
            }
          : cat
      )
    );
    setNewOtherItem('');
  };

  const toggleItem = (catId: string, itemId: number) => {
    setCategories(cats =>
      cats.map(cat =>
        cat.id === catId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cat
      )
    );
  };


  const packedCount = categories.reduce(
    (acc, cat) => acc + cat.items.filter(item => item.checked).length,
    0
  );
  const totalCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const progressPercentage = (packedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontelloIcon name="left-open-mini" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Bag Checklist</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Section */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Packing Progress</Text>
          <Text style={styles.progressCount}>{packedCount}/{totalCount}</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progressPercentage === 100
            ? '🎉 All set! You\'re ready to go!'
            : progressPercentage >= 75
            ? 'Almost there! Keep going!'
            : 'Start packing your hospital bag'}
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(cat => (
          <View key={cat.id} style={styles.categoryCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <FontelloIcon name={cat.icon} size={20} color="#fff" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{cat.label}</Text>
                <Text style={styles.categorySubtitle}>
                  {cat.items.filter(item => item.checked).length} of {cat.items.length} items packed
                </Text>
              </View>
            </View>

            {/* Category Items */}
            <View style={styles.itemsContainer}>
              {cat.id === 'other' && (
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.addItemInput}
                    value={newOtherItem}
                    onChangeText={setNewOtherItem}
                    placeholder="Add new item..."
                    placeholderTextColor="#999"
                    returnKeyType="done"
                    onSubmitEditing={addOtherItem}
                  />
                  <TouchableOpacity style={styles.addItemBtn} onPress={addOtherItem}>
                    <FontelloIcon name="plus" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              {cat.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => toggleItem(cat.id, item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      item.checked && styles.checkedBox,
                      { borderColor: cat.color }
                    ]}>
                      {item.checked && (
                        <FontelloIcon name="ok" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={[
                      styles.itemLabel,
                      item.checked && styles.checkedLabel
                    ]}>
                      {item.label}
                    </Text>
                    {item.checked && (
                      <View style={[styles.checkedBadge, { backgroundColor: cat.color }]}>
                        <FontelloIcon name="ok" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {cat.id === 'other' && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deleteOtherItem(item.id)}
                      activeOpacity={0.6}
                    >
                      <FontelloIcon name="cancel" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  headerRight: {
    width: 32,
  },
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  itemsContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    position: 'relative',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  checkedBox: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  itemLabel: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  checkedLabel: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  checkedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  addItemBtn: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});