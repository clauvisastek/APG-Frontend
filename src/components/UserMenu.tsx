import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { hasRole } from '../utils/roleHelpers';
import { getUserInitials } from '../utils/userInitials';
import './UserMenu.css';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = hasRole(user, 'Admin');
  const initials = getUserInitials(user);
  const displayName = user?.name || user?.email || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="user-menu">
      <button
        ref={buttonRef}
        className="user-menu-avatar"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {initials}
      </button>

      {isOpen && (
        <div ref={menuRef} className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-menu-avatar-large">{initials}</div>
            <div className="user-menu-info">
              <div className="user-menu-name">{displayName}</div>
              {user?.email && (
                <div className="user-menu-email">{user.email}</div>
              )}
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button
              className="user-menu-item"
              onClick={() => handleNavigation('/profile')}
            >
              <span className="user-menu-item-icon">👤</span>
              <span>Profil</span>
            </button>

            {isAdmin && (
              <button
                className="user-menu-item"
                onClick={() => handleNavigation('/admin')}
              >
                <span className="user-menu-item-icon">⚙️</span>
                <span>Administration</span>
              </button>
            )}

            <div className="user-menu-divider"></div>

            <button
              className="user-menu-item user-menu-item-logout"
              onClick={handleLogout}
            >
              <span className="user-menu-item-icon">🚪</span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
