import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { ScreenLoader } from '../../components/common/ScreenLoader';
import { useToastMessage } from '../../utils/toastMessage';
import { ChecklistItem, useHospitalChecklist } from './useHospitalChecklist';

// The backend sends icon names ('baby', 'suitcase') that are not in the
// Fontello glyph map, so category icons are chosen client-side.
const CATEGORY_ICONS: Record<string, string> = {
  mom: 'user',
  baby: 'smile',
  other: 'bag',
};

export default function HospitalChecklistScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { showToast } = useToastMessage();
  const {
    checklist,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch,
    toggleItem,
    addItem,
    deleteItem,
  } = useHospitalChecklist();
  const [newOtherItem, setNewOtherItem] = useState('');
  // Refresh failures while data is already shown surface as a toast
  const refreshError = checklist ? error : null;
  useEffect(() => {
    if (refreshError) {
      showToast(refreshError);
    }
    // showToast is recreated every render; only react to new errors
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshError]);

  const addOtherItem = async () => {
    const label = newOtherItem.trim();
    if (!label || isSaving) return;
    try {
      await addItem(label, 'other');
      setNewOtherItem('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to add item');
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    try {
      await toggleItem(item.id, !item.checked);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete item');
    }
  };

  const categories = checklist?.categories ?? [];
  const packedCount = checklist?.packed_count ?? 0;
  const totalCount = checklist?.total_count ?? 0;
  const progressPercentage =
    totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const header = (
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
  );

  if (isLoading && !checklist) {
    return (
      <View style={styles.container}>
        {header}
        <ScreenLoader message="Loading checklist..." />
      </View>
    );
  }

  if (!checklist) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.stateBox}>
          <FontelloIcon name="attention" size={40} color="#EF4444" />
          <Text style={styles.stateTitle}>Couldn't load checklist</Text>
          <Text style={styles.stateText}>
            {error || 'Something went wrong.'}
          </Text>
          <TouchableOpacity style={styles.stateBtn} onPress={() => refetch()}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}

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
          {totalCount > 0 && progressPercentage === 100
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch(true)}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      >
        {categories.map(cat => (
          <View key={cat.id} style={styles.categoryCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <FontelloIcon
                  name={CATEGORY_ICONS[cat.id] ?? 'bag'}
                  size={20}
                  color="#fff"
                />
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
                    maxLength={150}
                    onSubmitEditing={addOtherItem}
                    editable={!isSaving}
                  />
                  <TouchableOpacity
                    style={[styles.addItemBtn, isSaving && styles.disabled]}
                    onPress={addOtherItem}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <FontelloIcon name="plus" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              {cat.items.length === 0 && (
                <Text style={styles.emptyCategoryText}>No items yet</Text>
              )}
              {cat.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={styles.itemTouchable}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      item.checked && styles.checkedBox,
                      { borderColor: cat.color }
                    ]}>
                      {item.checked && (
                        <FontelloIcon name="check" size={14} color="#fff" />
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
                        <FontelloIcon name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {item.is_custom && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.6}
                      disabled={isSaving}
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
  itemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 6,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  stateBtn: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
