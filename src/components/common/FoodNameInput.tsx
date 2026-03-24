import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { THEME_COLORS } from '../../constants/colors';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export interface FoodSuggestion {
  id: number;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface FoodNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (food: FoodSuggestion) => void;
  placeholder?: string;
  style?: any;
}

export const FoodNameInput: React.FC<FoodNameInputProps> = ({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = 'Search food...',
  style,
}) => {
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const searchFood = useCallback(async (query: string, pageNum: number = 1) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get<{
        results: FoodSuggestion[];
        has_next: boolean;
        total: number;
      }>(
        `${APIS.v1.nutrition.foodSuggestions()}?q=${encodeURIComponent(query)}&page=${pageNum}&page_size=10`,
        { is_auth: true, abortPrevious: true },
      );

      if (pageNum === 1) {
        setSuggestions(response.results);
      } else {
        setSuggestions(prev => [...prev, ...response.results]);
      }
      setHasMore(response.has_next);
      setShowSuggestions(true);
    } catch (err: any) {
      console.error('Failed to search food:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle text change with debounce
  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      searchFood(text, 1);
    }, 300);
  }, [onChangeText, searchFood]);

  // Load more suggestions
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && value.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchFood(value, nextPage);
    }
  }, [hasMore, isLoading, page, value, searchFood]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((food: FoodSuggestion) => {
    onSelectSuggestion(food);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
  }, [onSelectSuggestion]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSuggestion = useCallback(({ item }: { item: FoodSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionDetails}>
          {item.calories} cal • C:{item.carbs}g • P:{item.protein}g • F:{item.fat}g
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleSelectSuggestion]);

  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={THEME_COLORS.primary} />
      </View>
    );
  }, [isLoading]);

  return (
    <View style={style}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onFocus={() => {
          if (value.trim() && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={item => item.id.toString()}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    position: 'relative',
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDetails: {
    fontSize: 13,
    color: '#666',
  },
  loadingFooter: {
    padding: 10,
    alignItems: 'center',
  },
});
