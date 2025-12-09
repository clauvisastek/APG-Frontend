import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setGlobalAuthTokenGetter, setGlobalLogoutHandler } from '../utils/authFetch';

/**
 * Hook to configure global authentication interceptor
 * - Automatically refreshes expired tokens
 * - Redirects to login on auth failures
 */
export function useAuthInterceptor() {
  const { getAccessTokenSilently, logout, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Configure token getter with automatic refresh capability
      setGlobalAuthTokenGetter(async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
            // Use cache by default - Auth0 will refresh automatically when needed
          });
          return token;
        } catch (error) {
          throw error;
        }
      });

      // Configure logout handler
      setGlobalLogoutHandler(() => {
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        });
      });
    }
  }, [isAuthenticated, getAccessTokenSilently, logout]);
}
