import { useState } from 'react';
import './QuickCreateModal.css';

interface QuickCreateCountryProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isoCode: string) => Promise<void>;
}

export const QuickCreateCountry = ({ isOpen, onClose, onCreate }: QuickCreateCountryProps) => {
  const [name, setName] = useState('');
  const [isoCode, setIsoCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; isoCode?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; isoCode?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    if (!isoCode.trim()) {
      newErrors.isoCode = 'Le code ISO est obligatoire';
    } else if (isoCode.length !== 2) {
      newErrors.isoCode = 'Le code ISO doit contenir 2 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(name.trim(), isoCode.trim().toUpperCase());
      setName('');
      setIsoCode('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating country:', error);
      alert('Erreur lors de la création du pays');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-create-overlay" onClick={onClose}>
      <div className="quick-create-modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="quick-create-header">
            <h3>Nouveau pays</h3>
            <button type="button" className="quick-create-close" onClick={onClose}>×</button>
          </div>
          <div className="quick-create-body">
            <div className="astek-form-group">
              <label className="astek-label">Nom <span className="required-star">*</span></label>
              <input
                type="text"
                className={`astek-input ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: undefined }));
                }}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && <div className="astek-error-message">{errors.name}</div>}
            </div>
            <div className="astek-form-group">
              <label className="astek-label">Code ISO <span className="required-star">*</span></label>
              <input
                type="text"
                className={`astek-input ${errors.isoCode ? 'is-invalid' : ''}`}
                value={isoCode}
                onChange={(e) => {
                  setIsoCode(e.target.value);
                  setErrors(prev => ({ ...prev, isoCode: undefined }));
                }}
                maxLength={2}
                disabled={isSubmitting}
              />
              {errors.isoCode && <div className="astek-error-message">{errors.isoCode}</div>}
            </div>
          </div>
          <div className="quick-create-footer">
            <button type="button" className="astek-btn astek-btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="astek-btn astek-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface QuickCreateCurrencyProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (code: string, name: string, symbol: string) => Promise<void>;
}

export const QuickCreateCurrency = ({ isOpen, onClose, onCreate }: QuickCreateCurrencyProps) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [errors, setErrors] = useState<{ code?: string; name?: string; symbol?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { code?: string; name?: string; symbol?: string } = {};

    if (!code.trim()) {
      newErrors.code = 'Le code est obligatoire';
    } else if (code.length !== 3) {
      newErrors.code = 'Le code doit contenir 3 caractères';
    }
    if (!name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    if (!symbol.trim()) {
      newErrors.symbol = 'Le symbole est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(code.trim().toUpperCase(), name.trim(), symbol.trim());
      setCode('');
      setName('');
      setSymbol('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating currency:', error);
      alert('Erreur lors de la création de la devise');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-create-overlay" onClick={onClose}>
      <div className="quick-create-modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="quick-create-header">
            <h3>Nouvelle devise</h3>
            <button type="button" className="quick-create-close" onClick={onClose}>×</button>
          </div>
          <div className="quick-create-body">
            <div className="astek-form-group">
              <label className="astek-label">Code <span className="required-star">*</span></label>
              <input
                type="text"
                className={`astek-input ${errors.code ? 'is-invalid' : ''}`}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrors(prev => ({ ...prev, code: undefined }));
                }}
                maxLength={3}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.code && <div className="astek-error-message">{errors.code}</div>}
            </div>
            <div className="astek-form-group">
              <label className="astek-label">Nom <span className="required-star">*</span></label>
              <input
                type="text"
                className={`astek-input ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: undefined }));
                }}
                disabled={isSubmitting}
              />
              {errors.name && <div className="astek-error-message">{errors.name}</div>}
            </div>
            <div className="astek-form-group">
              <label className="astek-label">Symbole <span className="required-star">*</span></label>
              <input
                type="text"
                className={`astek-input ${errors.symbol ? 'is-invalid' : ''}`}
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  setErrors(prev => ({ ...prev, symbol: undefined }));
                }}
                maxLength={5}
                disabled={isSubmitting}
              />
              {errors.symbol && <div className="astek-error-message">{errors.symbol}</div>}
            </div>
          </div>
          <div className="quick-create-footer">
            <button type="button" className="astek-btn astek-btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="astek-btn astek-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
