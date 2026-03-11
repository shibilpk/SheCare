import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/ApiClient';
import { APIS } from '../constants/apis';
import { BlogPost } from '../types/blog';

interface PaginatedBlogResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: BlogPost[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Hook to fetch paginated blog posts
 */
export function useBlogListPaginated() {
  const fetchBlogPage = useCallback(async (page: number): Promise<PaginatedResponse<BlogPost>> => {
    const response = await apiClient.get<PaginatedBlogResponse>(
      APIS.V1.BLOG.getPaginatedPosts(page)
    );

    // Transform the response to match InfiniteScrollList expectations
    return {
      count: response.count,
      next: response.next ? response.next.toString() : null,
      previous: response.previous ? response.previous.toString() : null,
      results: response.results,
    };
  }, []);

  return { fetchBlogPage };
}

/**
 * Hook to fetch all blog posts with optional limit (for home screen)
 */
export function useBlogList(limit?: number) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = limit
        ? APIS.V1.BLOG.getLatestPosts(limit)
        : APIS.V1.BLOG.LIST_POSTS;
      const response = await apiClient.get<PaginatedBlogResponse>(endpoint);
      setBlogs(response.results || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch blogs:', err);
      setError(err.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, isLoading, error, refetch: fetchBlogs };
}

/**
 * Hook to fetch a single blog post by ID
 */
export function useBlogDetail(blogId?: string) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!blogId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get<BlogPost>(
        APIS.V1.BLOG.getPost(blogId)
      );
      setBlog(response);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch blog:', err);
      setError(err.message || 'Failed to load blog');
      setBlog(null);
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return { blog, isLoading, error, refetch: fetchBlog };
}
