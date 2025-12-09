import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { UserMenu } from './UserMenu';
import { hasAnyRole } from '../utils/roleHelpers';
import './Layout.css';

export const Layout = () => {
  const location = useLocation();
  const { isAuthenticated, loginWithRedirect, isLoading, user } = useAuth0();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className="astek-layout">
      <nav className="astek-navbar">
        <div className="astek-navbar-content">
          <Link to="/" className="astek-navbar-brand">
            <strong>APG</strong> – Astek Profit Guard
          </Link>
          
          {isAuthenticated && (
            <div className="astek-navbar-menu">
              <Link 
                to="/" 
                className={`astek-navbar-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/projects" 
                className={`astek-navbar-link ${isActive('/projects') ? 'active' : ''}`}
              >
                Projets
              </Link>
              <Link 
                to="/clients" 
                className={`astek-navbar-link ${isActive('/clients') ? 'active' : ''}`}
              >
                Clients
              </Link>
              <Link 
                to="/technical-assignments" 
                className={`astek-navbar-link ${isActive('/technical-assignments') ? 'active' : ''}`}
              >
                AT
              </Link>
              <Link 
                to="/resources" 
                className={`astek-navbar-link ${isActive('/resources') ? 'active' : ''}`}
              >
                Ressources
              </Link>
              <Link 
                to="/calculette" 
                className={`astek-navbar-link ${isActive('/calculette') ? 'active' : ''}`}
              >
                Calculette
              </Link>
              {hasAnyRole(user, ['Admin', 'CFO']) && (
                <Link 
                  to="/business-units" 
                  className={`astek-navbar-link ${isActive('/business-units') ? 'active' : ''}`}
                >
                  Business Units
                </Link>
              )}
              <Link 
                to="/informations" 
                className={`astek-navbar-link ${isActive('/informations') ? 'active' : ''}`}
              >
                Informations
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isLoading ? (
              <div className="astek-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="astek-btn astek-btn-primary"
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '14px',
                }}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="astek-main">
        <Outlet />
      </main>

      <footer className="astek-footer">
        <div className="astek-footer-content">
          <p>© 2024 Astek Profit Guard – Gestion de la rentabilité des projets</p>
        </div>
      </footer>
    </div>
  );
};
