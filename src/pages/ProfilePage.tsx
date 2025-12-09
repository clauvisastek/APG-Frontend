import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRoles, hasRole } from '../utils/roleHelpers';
import './ProfilePage.css';

interface UserPreferences {
  language: 'fr' | 'en';
  defaultCurrency: 'CAD' | 'USD' | 'EUR';
  defaultLandingPage: 'dashboard' | 'projects' | 'clients' | 'admin';
}

const defaultPreferences: UserPreferences = {
  language: 'fr',
  defaultCurrency: 'CAD',
  defaultLandingPage: 'dashboard',
};

export const ProfilePage = () => {
  const { user, isLoading } = useAuth0();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  const userRoles = user ? getUserRoles(user) : [];
  const isAdmin = user ? hasRole(user, 'Admin') : false;

  const handlePreferenceChange = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setSaveMessage(''); // Clear message on change
  };

  const handleSavePreferences = () => {
    // TODO: Save to API in future
    setSaveMessage('Préférences enregistrées avec succès.');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    setSaveMessage('Préférences réinitialisées.');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const getRoleBadgeClass = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin') return 'profile-badge-admin';
    if (roleLower === 'cfo') return 'profile-badge-cfo';
    if (roleLower === 'vente' || roleLower === 'sales') return 'profile-badge-sales';
    return 'profile-badge-user';
  };

  const getRoleDisplayName = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin') return 'Admin';
    if (roleLower === 'cfo') return 'CFO';
    if (roleLower === 'vente' || roleLower === 'sales') return 'Vente';
    if (roleLower === 'user') return 'User';
    return role;
  };

  const formatLastLogin = (lastLogin: string | undefined): string => {
    if (!lastLogin) return 'Non disponible';
    
    try {
      const date = new Date(lastLogin);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Non disponible';
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--astek-text-muted)' }}>Chargement du profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <p style={{ color: 'var(--astek-text-muted)' }}>Impossible de charger les informations du profil.</p>
      </div>
    );
  }

  const lastLogin = user['https://apg-astek.com/last_login'] as string | undefined;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="astek-page-title">Profil utilisateur</h1>
          <p className="profile-subtitle">Informations de votre compte Astek Profit Guard.</p>
        </div>

        {/* Card 1: Account Information */}
        <div className="astek-card profile-card">
          <h2 className="profile-card-title">Informations du compte</h2>
          
          {/* User Identity Section */}
          <div className="profile-identity">
            <div className="profile-avatar-container">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar-initials">
                  {getInitials(user.name || user.nickname)}
                </div>
              )}
            </div>
            
            <div className="profile-identity-info">
              <h3 className="profile-name">{user.name || user.nickname || 'Utilisateur'}</h3>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          {/* Account Details */}
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Statut de vérification</span>
              <span className="profile-detail-value">
                {user.email_verified ? (
                  <span className="profile-verified-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Vérifié
                  </span>
                ) : (
                  <span className="profile-unverified-badge">Non vérifié</span>
                )}
              </span>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-label">Rôles</span>
              <div className="profile-detail-value">
                {userRoles.length > 0 ? (
                  <div className="profile-roles">
                    {userRoles.map((role) => (
                      <span key={role} className={`profile-badge ${getRoleBadgeClass(role)}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--astek-text-muted)' }}>Aucun rôle assigné</span>
                )}
              </div>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-label">Dernière connexion</span>
              <span className="profile-detail-value">{formatLastLogin(lastLogin)}</span>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-label">Identifiant Auth0</span>
              <span className="profile-detail-value profile-auth-id">{user.sub}</span>
            </div>
          </div>
        </div>

        {/* Card 2: APG Preferences */}
        <div className="astek-card profile-card">
          <h2 className="profile-card-title">Préférences APG</h2>
          <p className="profile-card-description">
            Personnalisez votre expérience dans l'application Astek Profit Guard.
          </p>

          {saveMessage && (
            <div className="astek-alert astek-alert-success" style={{ marginTop: '16px' }}>
              {saveMessage}
            </div>
          )}

          <div className="profile-preferences">
            {/* Language Preference */}
            <div className="profile-pref-row">
              <label htmlFor="language" className="profile-pref-label">
                Langue préférée
              </label>
              <div className="profile-pref-control">
                <select
                  id="language"
                  className="astek-select"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
            </div>

            {/* Currency Preference */}
            <div className="profile-pref-row">
              <label htmlFor="currency" className="profile-pref-label">
                Devise par défaut
              </label>
              <div className="profile-pref-control">
                <select
                  id="currency"
                  className="astek-select"
                  value={preferences.defaultCurrency}
                  onChange={(e) => handlePreferenceChange('defaultCurrency', e.target.value)}
                >
                  <option value="CAD">CAD (Dollar canadien)</option>
                  <option value="USD">USD (Dollar américain)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            {/* Landing Page Preference */}
            <div className="profile-pref-row">
              <label htmlFor="landingPage" className="profile-pref-label">
                Vue de démarrage
              </label>
              <div className="profile-pref-control">
                <select
                  id="landingPage"
                  className="astek-select"
                  value={preferences.defaultLandingPage}
                  onChange={(e) => handlePreferenceChange('defaultLandingPage', e.target.value)}
                >
                  <option value="dashboard">Tableau de bord</option>
                  <option value="projects">Projets</option>
                  <option value="clients">Clients</option>
                  {isAdmin && <option value="admin">Admin</option>}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button
              type="button"
              className="astek-btn astek-btn-ghost"
              onClick={handleResetPreferences}
            >
              Réinitialiser
            </button>
            <button
              type="button"
              className="astek-btn astek-btn-primary"
              onClick={handleSavePreferences}
            >
              Enregistrer les préférences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
