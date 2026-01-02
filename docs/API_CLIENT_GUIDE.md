# API Client Guide

A comprehensive TypeScript API wrapper class using native Fetch API with advanced features including authentication, token refresh, request queuing, and abort control.

## Features

✅ **Native Fetch API** - No external dependencies like Axios
✅ **TypeScript Support** - Fully typed with interfaces and error handling
✅ **Authentication Interceptor** - Automatic Bearer token attachment
✅ **Silent Token Refresh** - Automatic 401 handling with token refresh
✅ **Request Queueing** - Multiple simultaneous 401s trigger single refresh
✅ **Abort Controller** - Cancel in-flight requests to same endpoint
✅ **Custom Error Handling** - Distinguish between network, server, and cancelled errors
✅ **Interceptors** - Request and response interceptors support
✅ **Method Shortcuts** - Convenience methods for GET, POST, PUT, DELETE, PATCH

---

## Installation

The `ApiClient` is already created in `src/utils/ApiClient.tsx`. You need to:

1. Install required dependency:
```bash
npm install @react-native-async-storage/async-storage
```

2. Update the base URL in [ApiClient.tsx](../src/utils/ApiClient.tsx):
```typescript
const apiClient = new ApiClient('https://your-api-domain.com');
```

---

## Basic Usage

### Import the client

```typescript
import apiClient, { APIError } from '@/utils/ApiClient';
```

### GET Request

```typescript
// Simple GET request
const users = await apiClient.get('/users');

// GET with query parameters (add them to the endpoint)
const user = await apiClient.get('/users/123');
```

### POST Request

```typescript
// POST with data
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### PUT Request

```typescript
// Update user
const updatedUser = await apiClient.put('/users/123', {
  name: 'Jane Doe'
});
```

### DELETE Request

```typescript
// Delete user
await apiClient.delete('/users/123');
```

### PATCH Request

```typescript
// Partial update
const result = await apiClient.patch('/users/123', {
  email: 'newemail@example.com'
});
```

---

## Advanced Usage

### 1. Authentication Control

By default, all requests include authentication (`is_auth: true`). To make a request without authentication:

```typescript
// Public endpoint - no auth token
const publicData = await apiClient.get('/public/data', {
  is_auth: false
});

// Login endpoint - no auth token
const loginResponse = await apiClient.post(
  '/auth/login',
  { email, password },
  { is_auth: false }
);
```

### 2. Abort Previous Requests

Cancel any in-flight request to the same endpoint before starting a new one:

```typescript
// Search example - only keep latest search request
const searchUsers = async (query: string) => {
  const results = await apiClient.get(`/users/search?q=${query}`, {
    abortPrevious: true // Cancels previous search if still running
  });
  return results;
};

// TypeScript example
const handleSearch = (text: string) => {
  searchUsers(text); // Previous searches auto-cancelled
};
```

### 3. Custom Headers

```typescript
// Add custom headers to a specific request
const data = await apiClient.get('/users', {
  headers: {
    'X-Custom-Header': 'value',
    'Accept-Language': 'en-US'
  }
});
```

### 4. Using callApi Directly

```typescript
// Full control with callApi
const response = await apiClient.callApi('/users/123', {
  method: 'PATCH',
  data: { status: 'active' },
  is_auth: true,
  abortPrevious: false,
  headers: { 'X-Custom': 'value' }
});
```

---

## Error Handling

The `APIError` class provides detailed error information:

```typescript
try {
  const users = await apiClient.get('/users');
} catch (error) {
  if (error instanceof APIError) {
    switch (error.type) {
      case 'network':
        // Network connection issue
        console.error('Network error:', error.message);
        // Show offline message to user
        break;

      case 'server':
        // Server returned 4xx or 5xx
        console.error('Server error:', error.statusCode, error.data);

        if (error.statusCode === 404) {
          // Handle not found
        } else if (error.statusCode === 500) {
          // Handle server error
        }
        break;

      case 'cancelled':
        // Request was aborted
        console.log('Request cancelled');
        // Usually can be ignored
        break;
    }
  }
}
```

### Error Properties

```typescript
interface APIError {
  message: string;           // Error message
  type: 'network' | 'server' | 'cancelled';
  statusCode?: number;       // HTTP status code (for server errors)
  data?: any;               // Response data (for server errors)
}
```

---

## Authentication & Token Refresh

### How It Works

1. **Initial Request**: All requests with `is_auth: true` (default) automatically include the Bearer token from AsyncStorage

2. **401 Detection**: When a request receives a 401 Unauthorized:
   - Triggers refresh token API call
   - Queues the failed request

3. **Request Queueing**: If multiple APIs fail with 401 simultaneously:
   - Only **one** refresh call is made
   - All failed requests wait in a queue

4. **Token Update**: After successful refresh:
   - New tokens stored in AsyncStorage
   - All queued requests retry with new token

5. **Refresh Failure**: If refresh fails:
   - All tokens cleared from storage
   - User redirected to login screen
   - All queued requests rejected

### Example Flow

```typescript
// Multiple simultaneous API calls
const [userData, postsData, messagesData] = await Promise.all([
  apiClient.get('/user/profile'),      // Returns 401
  apiClient.get('/user/posts'),        // Returns 401
  apiClient.get('/user/messages'),     // Returns 401
]);

// What happens internally:
// 1. All 3 requests fail with 401
// 2. First 401 triggers refresh token call
// 3. Other 2 requests queued (no additional refresh calls)
// 4. Refresh succeeds, new token saved
// 5. All 3 requests retry automatically with new token
// 6. Data returned to Promise.all
```

### Token Storage

The client expects these keys in AsyncStorage:

```typescript
// After successful login, store:
await AsyncStorage.setItem('access_token', 'your-access-token');
await AsyncStorage.setItem('refresh_token', 'your-refresh-token');
await AsyncStorage.setItem('user_data', JSON.stringify(userData));
```

### Customizing Refresh Endpoint

Update the refresh endpoint in [ApiClient.tsx](../src/utils/ApiClient.tsx#L123):

```typescript
private async refreshAccessToken(): Promise<void> {
  const refreshToken = await AsyncStorage.getItem('refresh_token');

  const response = await fetch(`${this.baseURL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  // ... rest of the code
}
```

---

## Interceptors

### Request Interceptors

Modify requests before they're sent:

```typescript
// Add custom request interceptor
apiClient.addRequestInterceptor(async (url, options) => {
  // Add timestamp to all requests
  const modifiedOptions = {
    ...options,
    headers: {
      ...options.headers,
      'X-Request-Time': new Date().toISOString()
    }
  };

  return { url, options: modifiedOptions };
});

// Add device info to headers
apiClient.addRequestInterceptor(async (url, options) => {
  const deviceId = await AsyncStorage.getItem('device_id');

  return {
    url,
    options: {
      ...options,
      headers: {
        ...options.headers,
        'X-Device-ID': deviceId || 'unknown'
      }
    }
  };
});
```

### Response Interceptors

Process responses before they're returned:

```typescript
// Log all responses
apiClient.addResponseInterceptor(async (response) => {
  console.log(`Response from ${response.url}: ${response.status}`);
  return response;
});

// Transform response data
apiClient.addResponseInterceptor(async (response) => {
  // Clone response to read it without consuming
  const cloned = response.clone();
  const data = await cloned.json();

  // Log analytics
  trackAPIResponse(response.url, response.status);

  return response; // Return original response
});
```

---

## Utility Methods

### Cancel Specific Request

```typescript
// Start a long-running request
apiClient.get('/large-dataset', { abortPrevious: true });

// Later, cancel it
apiClient.cancelRequest('/large-dataset');
```

### Cancel All Requests

```typescript
// Cancel all in-flight requests (e.g., on logout)
apiClient.cancelAllRequests();
```

### Update Base URL

```typescript
// Switch to different environment
apiClient.setBaseURL('https://staging-api.yourdomain.com');
```

### Update Default Headers

```typescript
// Add default headers for all requests
apiClient.setDefaultHeaders({
  'X-App-Version': '1.0.0',
  'X-Platform': 'ios'
});
```

---

## React Hooks Integration

### Custom Hook Example

```typescript
import { useState, useEffect } from 'react';
import apiClient, { APIError } from '@/utils/ApiClient';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.get('/users');
        setUsers(data);
      } catch (err) {
        if (err instanceof APIError) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
```

### Search with Debounce

```typescript
import { useState, useEffect } from 'react';
import apiClient from '@/utils/ApiClient';

export const useSearch = (query: string, delay: number = 300) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await apiClient.get(`/search?q=${query}`, {
          abortPrevious: true // Cancel previous search
        });
        setResults(data);
      } catch (error) {
        if (error instanceof APIError && error.type !== 'cancelled') {
          console.error('Search error:', error);
        }
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { results, loading };
};
```

---

## Complete Example: Login Flow

```typescript
import apiClient, { APIError } from '@/utils/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Login function
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post(
      '/auth/login',
      { email, password },
      { is_auth: false } // No auth token needed for login
    );

    // Store tokens
    await AsyncStorage.setItem('access_token', response.access_token);
    await AsyncStorage.setItem('refresh_token', response.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.user));

    return response.user;
  } catch (error) {
    if (error instanceof APIError) {
      if (error.type === 'server' && error.statusCode === 401) {
        throw new Error('Invalid credentials');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      }
    }
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    // Call logout endpoint (optional)
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Clear all stored data
    await AsyncStorage.multiRemove([
      'access_token',
      'refresh_token',
      'user_data'
    ]);

    // Cancel all pending requests
    apiClient.cancelAllRequests();
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const user = await apiClient.get('/user/profile');
    return user;
  } catch (error) {
    if (error instanceof APIError) {
      console.error('Failed to fetch user:', error);
    }
    throw error;
  }
};
```

---

## TypeScript Types

```typescript
// API Options
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  is_auth?: boolean;
  abortPrevious?: boolean;
  headers?: Record<string, string>;
}

// Custom API Error
class APIError extends Error {
  type: 'network' | 'server' | 'cancelled';
  statusCode?: number;
  data?: any;
}

// Interceptor types
type RequestInterceptor = (
  url: string,
  options: RequestInit
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };

type ResponseInterceptor = (
  response: Response
) => Promise<Response> | Response;
```

---

## Testing

### Mock API Client for Tests

```typescript
// __mocks__/ApiClient.ts
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  callApi: jest.fn(),
};

export default mockApiClient;
export { APIError } from '../ApiClient';
```

### Example Test

```typescript
import apiClient from '@/utils/ApiClient';

jest.mock('@/utils/ApiClient');

describe('User Service', () => {
  it('should fetch users', async () => {
    const mockUsers = [{ id: 1, name: 'John' }];
    (apiClient.get as jest.Mock).mockResolvedValue(mockUsers);

    const users = await apiClient.get('/users');

    expect(users).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith('/users');
  });
});
```

---

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use abortPrevious for search**: Prevent race conditions in search inputs
3. **Set is_auth: false for public endpoints**: Don't send tokens to public APIs
4. **Store tokens securely**: Use AsyncStorage or encrypted storage
5. **Clear tokens on logout**: Prevent unauthorized access
6. **Use TypeScript types**: Define interfaces for API responses
7. **Implement loading states**: Show loading indicators during API calls
8. **Handle offline scenarios**: Detect network errors and inform users
9. **Log errors appropriately**: Use error tracking services in production
10. **Test error scenarios**: Mock API failures in tests

---

## Configuration Checklist

- [ ] Update base URL in ApiClient.tsx
- [ ] Install @react-native-async-storage/async-storage
- [ ] Configure refresh token endpoint
- [ ] Set up navigation reference in Navigation.tsx
- [ ] Define login screen route name
- [ ] Test authentication flow
- [ ] Test token refresh mechanism
- [ ] Implement error handling UI
- [ ] Add loading states to components
- [ ] Set up error tracking (optional)

---

## Troubleshooting

### Issue: Infinite refresh loop

**Solution**: Ensure refresh endpoint has `is_auth: false` or doesn't return 401

### Issue: "No refresh token available"

**Solution**: Store refresh_token after login:
```typescript
await AsyncStorage.setItem('refresh_token', token);
```

### Issue: Navigation not working after refresh failure

**Solution**: Ensure navigationRef is properly set up in Navigation.tsx:
```typescript
import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
```

### Issue: AbortError in console

**Solution**: This is expected when using `abortPrevious: true`. Filter these errors:
```typescript
if (error.type !== 'cancelled') {
  // Show error to user
}
```

---

## Additional Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [AbortController Documentation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation Documentation](https://reactnavigation.org/)

---

**Need help?** Check the implementation in [ApiClient.tsx](../src/utils/ApiClient.tsx) or refer to the examples above.
