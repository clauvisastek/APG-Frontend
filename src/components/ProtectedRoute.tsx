import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component to secure private pages.
 * 
 * Behavior:
 * - Shows loading spinner while Auth0 checks authentication state
 * - Redirects to Auth0 login if user is not authenticated
 * - Renders children if user is authenticated
 * - Persists session across page refreshes using localstorage cache
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: window.location.pathname,
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Loading state - Auth0 is checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--astek-bg)',
        }}
      >
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '24px', fontSize: '16px', color: 'var(--astek-text-muted)' }}>
          Vérification de l'authentification...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--astek-bg)',
          padding: '20px',
        }}
      >
        <div className="astek-alert astek-alert-error" style={{ maxWidth: '500px' }}>
          <strong>Erreur d'authentification</strong>
          <p style={{ marginTop: '8px', marginBottom: '0' }}>{error.message}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show redirecting message while useEffect triggers redirect
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--astek-bg)',
        }}
      >
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '24px', fontSize: '16px', color: 'var(--astek-text-muted)' }}>
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  // Authenticated - render protected content
  return <>{children}</>;
};
