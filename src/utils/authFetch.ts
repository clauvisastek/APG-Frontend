// Global token getter and logout handler for all API services
let getTokenFunction: (() => Promise<string>) | null = null;
let logoutFunction: (() => void) | null = null;

export function setGlobalAuthTokenGetter(fn: () => Promise<string>) {
  getTokenFunction = fn;
}

export function setGlobalLogoutHandler(fn: () => void) {
  logoutFunction = fn;
}

export async function getAuthToken(): Promise<string | null> {
  if (!getTokenFunction) {
    console.warn('⚠️ Token function not initialized - user may not be authenticated yet');
    return null;
  }

  try {
    const token = await getTokenFunction();
    if (!token) {
      console.warn('⚠️ Token function returned empty token');
    }
    return token;
  } catch (error) {
    console.error('❌ Failed to get auth token:', error);
    return null;
  }
}

/**
 * Helper function to make authenticated API calls with automatic token refresh on 401
 */
export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log('🔑 fetchWithAuth called for:', url);
  
  const makeRequest = async (retryCount = 0): Promise<T> => {
    const token = await getAuthToken();
    console.log('🎫 Token retrieved:', token ? 'YES' : 'NO');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 Making request to:', url, retryCount > 0 ? `(retry ${retryCount})` : '');
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📥 Response status:', response.status);

    // Handle 401 Unauthorized - Token expired
    if (response.status === 401 && retryCount === 0) {
      console.warn('⚠️ 401 Unauthorized - Token might be expired, attempting refresh...');
      
      try {
        // Clear cache and force token refresh
        if (getTokenFunction) {
          // Auth0 will automatically refresh the token if refresh tokens are enabled
          const newToken = await getTokenFunction();
          if (newToken) {
            console.log('✅ Token refreshed successfully, retrying request...');
            // Retry the request with the new token
            return makeRequest(retryCount + 1);
          }
        }
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError);
        // Only logout if it's truly an auth error, not a network issue
        if (refreshError?.error === 'login_required' || refreshError?.error === 'consent_required') {
          if (logoutFunction) {
            console.log('🚪 Logging out user due to authentication failure...');
            logoutFunction();
          }
          throw new Error('Session expired. Please log in again.');
        }
        // For other errors, just throw without logging out
        throw refreshError;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error('❌ Request failed:', error);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    console.log('✅ Response data:', data);
    return data;
  };

  return makeRequest();
}
