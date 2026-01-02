# API Client - Real-World Usage Examples

Practical examples demonstrating how to use the ApiClient in your React Native application.

---

## 1. Authentication Service

Complete authentication service with login, logout, register, and token management.

```typescript
// src/services/authService.ts
import apiClient, { APIError } from '@/utils/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials,
        { is_auth: false }
      );

      // Store tokens
      await AsyncStorage.multiSet([
        ['access_token', response.access_token],
        ['refresh_token', response.refresh_token],
        ['user_data', JSON.stringify(response.user)],
      ]);

      return response;
    } catch (error) {
      if (error instanceof APIError) {
        if (error.statusCode === 401) {
          throw new Error('Invalid email or password');
        } else if (error.type === 'network') {
          throw new Error('Unable to connect. Check your internet connection.');
        }
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data,
        { is_auth: false }
      );

      // Store tokens
      await AsyncStorage.multiSet([
        ['access_token', response.access_token],
        ['refresh_token', response.refresh_token],
        ['user_data', JSON.stringify(response.user)],
      ]);

      return response;
    } catch (error) {
      if (error instanceof APIError && error.statusCode === 422) {
        throw new Error(error.data?.message || 'Invalid registration data');
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear storage regardless of API call result
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user_data',
      ]);

      // Cancel all pending requests
      apiClient.cancelAllRequests();
    }
  },

  // Get current user from storage
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Fetch fresh user data from API
  fetchUserProfile: async () => {
    return await apiClient.get('/user/profile');
  },

  // Update user profile
  updateProfile: async (updates: Partial<{ name: string; email: string }>) => {
    return await apiClient.put('/user/profile', updates);
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return await apiClient.post('/user/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },
};
```

---

## 2. User Management Service

```typescript
// src/services/userService.ts
import apiClient from '@/utils/ApiClient';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  perPage: number;
}

export const userService = {
  // Get all users with pagination
  getUsers: async (page: number = 1, perPage: number = 20): Promise<PaginatedUsers> => {
    return await apiClient.get(`/users?page=${page}&per_page=${perPage}`);
  },

  // Get single user
  getUser: async (userId: string): Promise<User> => {
    return await apiClient.get(`/users/${userId}`);
  },

  // Search users (with abort previous)
  searchUsers: async (query: string): Promise<User[]> => {
    return await apiClient.get(`/users/search?q=${query}`, {
      abortPrevious: true, // Cancel previous searches
    });
  },

  // Create user
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    return await apiClient.post('/users', userData);
  },

  // Update user
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    return await apiClient.put(`/users/${userId}`, updates);
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    return await apiClient.delete(`/users/${userId}`);
  },

  // Upload avatar
  uploadAvatar: async (userId: string, imageUri: string): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    return await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
```

---

## 3. Posts/Feed Service

```typescript
// src/services/postService.ts
import apiClient from '@/utils/ApiClient';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
}

export const postService = {
  // Get feed
  getFeed: async (page: number = 1): Promise<Post[]> => {
    return await apiClient.get(`/posts?page=${page}`);
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    return await apiClient.get(`/posts/${postId}`);
  },

  // Create post
  createPost: async (data: CreatePostData): Promise<Post> => {
    return await apiClient.post('/posts', data);
  },

  // Update post
  updatePost: async (postId: string, data: Partial<CreatePostData>): Promise<Post> => {
    return await apiClient.put(`/posts/${postId}`, data);
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    return await apiClient.delete(`/posts/${postId}`);
  },

  // Like post
  likePost: async (postId: string): Promise<void> => {
    return await apiClient.post(`/posts/${postId}/like`);
  },

  // Unlike post
  unlikePost: async (postId: string): Promise<void> => {
    return await apiClient.delete(`/posts/${postId}/like`);
  },

  // Get comments
  getComments: async (postId: string): Promise<Comment[]> => {
    return await apiClient.get(`/posts/${postId}/comments`);
  },

  // Add comment
  addComment: async (postId: string, content: string): Promise<Comment> => {
    return await apiClient.post(`/posts/${postId}/comments`, { content });
  },
};
```

---

## 4. React Component Examples

### Login Screen

```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { authService } from '@/services/authService';
import { APIError } from '@/utils/ApiClient';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigation.replace('Home');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button
        title="Login"
        onPress={handleLogin}
        disabled={loading}
      />
      {loading && <ActivityIndicator />}
    </View>
  );
};
```

### User List with Search

```typescript
// src/screens/UsersScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Text } from 'react-native';
import { userService } from '@/services/userService';
import { APIError } from '@/utils/ApiClient';

export const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery) {
      loadUsers();
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await userService.searchUsers(searchQuery);
        setUsers(results);
        setError(null);
      } catch (err) {
        if (err instanceof APIError && err.type !== 'cancelled') {
          setError('Search failed');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
          </View>
        )}
        refreshing={loading}
        onRefresh={loadUsers}
      />
    </View>
  );
};
```

---

## 5. Custom Hooks

### useApi Hook

```typescript
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { APIError } from '@/utils/ApiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T,>(apiFunc: (...args: any[]) => Promise<T>) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunc(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const errorMessage = err instanceof APIError
          ? err.message
          : 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw err;
      }
    },
    [apiFunc]
  );

  return {
    ...state,
    execute,
  };
};

// Usage example:
const UserProfile = ({ userId }) => {
  const { data: user, loading, error, execute } = useApi(userService.getUser);

  useEffect(() => {
    execute(userId);
  }, [userId, execute]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  if (!user) return null;

  return <Text>{user.name}</Text>;
};
```

### usePagination Hook

```typescript
// src/hooks/usePagination.ts
import { useState, useCallback } from 'react';

export const usePagination = <T,>(
  fetchFunc: (page: number) => Promise<T[]>
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await fetchFunc(page);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunc]);

  const refresh = useCallback(async () => {
    setPage(1);
    setData([]);
    setHasMore(true);
    setLoading(true);

    try {
      const newData = await fetchFunc(1);
      setData(newData);
      setPage(2);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunc]);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    refresh,
  };
};

// Usage example:
const FeedScreen = () => {
  const { data, loading, hasMore, loadMore, refresh } = usePagination(
    postService.getFeed
  );

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={refresh}
      ListFooterComponent={hasMore ? <ActivityIndicator /> : null}
    />
  );
};
```

---

## 6. Error Boundary for API Errors

```typescript
// src/components/ApiErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';
import { APIError } from '@/utils/ApiClient';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      const error = this.state.error;
      let message = 'Something went wrong';

      if (error instanceof APIError) {
        if (error.type === 'network') {
          message = 'Network error. Please check your connection.';
        } else if (error.type === 'server') {
          message = `Server error: ${error.statusCode}`;
        }
      }

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>{message}</Text>
          <Button title="Retry" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Offline Detection & Queue

```typescript
// src/utils/offlineQueue.ts
import NetInfo from '@react-native-community/netinfo';
import apiClient from './ApiClient';

interface QueuedRequest {
  endpoint: string;
  options: any;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isOnline = true;

  constructor() {
    this.initNetworkListener();
  }

  private initNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Process queue when coming back online
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  async addToQueue(endpoint: string, options: any) {
    if (this.isOnline) {
      return apiClient.callApi(endpoint, options);
    }

    // Add to queue for later
    this.queue.push({
      endpoint,
      options,
      timestamp: Date.now(),
    });

    throw new Error('No internet connection. Request queued.');
  }

  private async processQueue() {
    const queueCopy = [...this.queue];
    this.queue = [];

    for (const request of queueCopy) {
      try {
        await apiClient.callApi(request.endpoint, request.options);
      } catch (error) {
        console.error('Failed to process queued request:', error);
        // Re-queue if still failing
        this.queue.push(request);
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
```

---

## 8. TypeScript Response Types

```typescript
// src/types/api.ts

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Error response
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth responses
export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Usage with typed API calls
const login = async (email: string, password: string): Promise<LoginResponse> => {
  return await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
};
```

---

## 9. Integration with React Query

```typescript
// src/hooks/useUserQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';

// Fetch user
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      userService.updateUser(userId, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

// Usage in component
const UserProfile = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleUpdate = () => {
    updateUser.mutate({
      userId,
      updates: { name: 'New Name' },
    });
  };

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading user</Text>;

  return (
    <View>
      <Text>{user.name}</Text>
      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
};
```

---

## 10. Testing Examples

```typescript
// __tests__/authService.test.ts
import { authService } from '@/services/authService';
import apiClient, { APIError } from '@/utils/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@/utils/ApiClient');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        user: { id: '1', name: 'John', email: 'john@example.com' },
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['access_token', 'access_token_123'],
        ['refresh_token', 'refresh_token_123'],
        ['user_data', JSON.stringify(mockResponse.user)],
      ]);
    });

    it('should throw error on invalid credentials', async () => {
      const error = new APIError('Unauthorized', 'server', 401);
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        authService.login({ email: 'wrong@email.com', password: 'wrong' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error on network failure', async () => {
      const error = new APIError('Network error', 'network');
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        authService.login({ email: 'john@example.com', password: 'password' })
      ).rejects.toThrow('Unable to connect');
    });
  });

  describe('logout', () => {
    it('should clear storage and cancel requests', async () => {
      await authService.logout();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'access_token',
        'refresh_token',
        'user_data',
      ]);
      expect(apiClient.cancelAllRequests).toHaveBeenCalled();
    });
  });
});
```

---

These examples cover most real-world scenarios you'll encounter. Feel free to adapt them to your specific needs!
