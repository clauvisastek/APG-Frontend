import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

/**
 * Custom hook to make authenticated API calls using Auth0 tokens
 */
export function useAuthenticatedFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const authenticatedFetch = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      try {
        const token = await getAccessTokenSilently();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null as T;
        }

        return response.json();
      } catch (error) {
        throw error;
      }
    },
    [getAccessTokenSilently]
  );

  return authenticatedFetch;
}
