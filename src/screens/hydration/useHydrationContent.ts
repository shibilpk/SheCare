import { useState, useEffect } from 'react';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export interface HydrationContentItem {
  id: number;
  content_type: string;
  icon: string;
  text: string;
  order: number;
}

export interface HydrationContent {
  benefits: HydrationContentItem[];
  tips: HydrationContentItem[];
}

export function useHydrationContent() {
  const [content, setContent] = useState<HydrationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<HydrationContent>(
          APIS.V1.HYDRATION.HYDRATION_CONTENT,
          { is_auth: true }
        );
        setContent(response);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch hydration content:', err);
        setError(err?.normalizedError?.message || 'Failed to load hydration content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return {
    content,
    isLoading,
    error,
  };
}
