import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Loading state
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
          Chargement...
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

  // Not authenticated - trigger redirect (useEffect will handle this)
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
          Redirection vers la page de connexion...
        </p>
      </div>
    );
  }

  // Authenticated - render protected content
  return <>{children}</>;
};
