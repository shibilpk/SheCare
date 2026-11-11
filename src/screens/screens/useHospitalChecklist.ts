import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export type ChecklistCategoryId = 'mom' | 'baby' | 'other';

export interface ChecklistItem {
  id: number;
  label: string;
  checked: boolean;
  is_custom: boolean;
}

export interface ChecklistCategory {
  id: ChecklistCategoryId;
  label: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
}

export interface Checklist {
  categories: ChecklistCategory[];
  packed_count: number;
  total_count: number;
}

const errorMessage = (err: any, fallback: string): string =>
  err?.normalizedError?.message || fallback;

/** Flip one item's `checked` locally and recompute the counts. */
function applyToggle(
  checklist: Checklist,
  itemId: number,
  checked: boolean,
): Checklist {
  const categories = checklist.categories.map(cat => ({
    ...cat,
    items: cat.items.map(item =>
      item.id === itemId ? { ...item, checked } : item,
    ),
  }));
  const packed_count = categories.reduce(
    (acc, cat) => acc + cat.items.filter(i => i.checked).length,
    0,
  );
  return { ...checklist, categories, packed_count };
}

export function useHospitalChecklist() {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checklistRef = useRef<Checklist | null>(null);
  checklistRef.current = checklist;

  const fetchChecklist = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const response = await apiClient.get<Checklist>(
        APIS.v1.pregnancy.checklist(),
      );
      setChecklist(response);
      setError(null);
    } catch (err: any) {
      console.info('Failed to fetch checklist:', err);
      setError(errorMessage(err, 'Failed to load checklist'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  /** Optimistic toggle; rolls the single item back if the PATCH fails. */
  const toggleItem = useCallback(async (itemId: number, checked: boolean) => {
    setChecklist(prev => (prev ? applyToggle(prev, itemId, checked) : prev));
    try {
      const response = await apiClient.patch<Checklist>(
        APIS.v1.pregnancy.checklistItem(itemId),
        { checked },
      );
      setChecklist(response);
    } catch (err: any) {
      setChecklist(prev => (prev ? applyToggle(prev, itemId, !checked) : prev));
      throw new Error(errorMessage(err, 'Failed to update item'));
    }
  }, []);

  const addItem = useCallback(
    async (label: string, category: ChecklistCategoryId = 'other') => {
      try {
        setIsSaving(true);
        const response = await apiClient.post<Checklist>(
          APIS.v1.pregnancy.checklistItems(),
          { label, category },
        );
        setChecklist(response);
      } catch (err: any) {
        throw new Error(errorMessage(err, 'Failed to add item'));
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deleteItem = useCallback(async (itemId: number) => {
    try {
      setIsSaving(true);
      const response = await apiClient.delete<Checklist>(
        APIS.v1.pregnancy.checklistItem(itemId),
      );
      setChecklist(response);
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Failed to delete item'));
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    checklist,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch: fetchChecklist,
    toggleItem,
    addItem,
    deleteItem,
  };
}
