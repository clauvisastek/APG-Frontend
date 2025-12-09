import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAnyRole } from '../utils/roleHelpers';

interface RequireRoleProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

/**
 * RequireRole component to secure pages that require specific roles.
 * 
 * Behavior:
 * - Shows loading spinner while Auth0 checks authentication state
 * - Redirects to Auth0 login if user is not authenticated
 * - Redirects to /projects if user doesn't have required role
 * - Renders children if user is authenticated and has required role
 * - Persists session across page refreshes using localstorage cache
 */
export const RequireRole = ({ children, requiredRoles }: RequireRoleProps) => {
  const { isLoading, isAuthenticated, user, error, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect to login if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: window.location.pathname,
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    // Redirect to projects if user is authenticated but doesn't have required role
    if (!isLoading && isAuthenticated && user) {
      const hasRequiredRole = hasAnyRole(user, requiredRoles);
      if (!hasRequiredRole) {
        navigate('/projects', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, navigate]);

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
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  // Check role - if user doesn't have required role, they'll be redirected by useEffect
  // While redirecting, show loading
  if (!hasAnyRole(user, requiredRoles)) {
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
          Vérification des droits d'accès...
        </p>
      </div>
    );
  }

  // Authenticated with required role - render protected content
  return <>{children}</>;
};
