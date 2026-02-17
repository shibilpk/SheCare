import { APIS } from '@src/constants/apis';
import apiClient from '@src/services/ApiClient';
import { useState, useEffect } from 'react';

export interface RatingItem {
  id: string;
  title: string;
  emoji: string;
}

export interface RatingSection {
  heading: string;
  items: RatingItem[];
}

export interface RatingData {
  sections: RatingSection[];
  isLoading: boolean;
  error: string | null;
  heading?: string;
  sub_heading?: string;
}

interface RatingDataResponse {
  sections: RatingSection[];
}

/**
 * Custom hook to fetch rating data (for rating different aspects of wellness)
 * This hook should be used at a high level (e.g., in RootNavigation) to avoid
 * re-fetching data every time the modal opens.
 */
export function useRatingData(): RatingData {
  const [sections, setSections] = useState<RatingSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<RatingDataResponse>(
          APIS.V1.ACTIVITIES.RATING_LIST,
        );
        setSections(res.sections || []);
      } catch (e) {
        console.info('Failed to fetch rating data', e);
        setError('Failed to load rating data');
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRatingData();
  }, []);

  return {
    sections,
    isLoading,
    error,
  };
}
