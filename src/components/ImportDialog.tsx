import { useState } from 'react';
import { toast } from 'react-toastify';
import type { ImportConfig, ImportResult, ColumnDefinition } from '../types/import';
import './ImportDialog.css';

interface ImportDialogProps {
  config: ImportConfig;
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  onSuccess?: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  config,
  isOpen,
  onClose,
  onImport,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedFormats = ['.csv', '.xlsx', '.xls'];

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.includes(fileExtension)) {
      toast.error(`Format non supporté. Formats acceptés: ${acceptedFormats.join(', ')}`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 MB)');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setIsImporting(true);
      const result = await onImport(selectedFile);

      if (result.success) {
        toast.success(result.message || `${result.importedCount} lignes importées avec succès`);
        if (result.errors && result.errors.length > 0) {
          toast.warning(`Attention: ${result.errors.length} erreurs détectées`);
        }
        setSelectedFile(null);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(result.message || 'Erreur lors de l\'import');
        if (result.errors && result.errors.length > 0) {
          console.error('Erreurs d\'import:', result.errors);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Générer un fichier CSV template côté client
    const headers = config.columns.map(col => col.name).join(',');
    const examples = config.columns.map(col => col.example || '').join(',');
    const csvContent = `${headers}\n${examples}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = config.templateFileName;
    link.click();
    
    toast.info(`Modèle "${config.templateFileName}" téléchargé`);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderColumnBadge = (col: ColumnDefinition) => {
    return (
      <div key={col.name} className="import-column-item">
        <div className="import-column-header">
          <span className="import-column-name">{col.name}</span>
          {col.required && <span className="import-badge import-badge-required">Obligatoire</span>}
        </div>
        <div className="import-column-label">{col.label}</div>
        {col.description && (
          <div className="import-column-description">{col.description}</div>
        )}
        {col.example && (
          <div className="import-column-example">Ex: {col.example}</div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="astek-modal-overlay" onClick={onClose}>
      <div className="astek-modal-content astek-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="astek-modal-header">
          <h3 className="astek-modal-title">{config.title}</h3>
          <button className="astek-modal-close" onClick={onClose} disabled={isImporting}>
            ✖
          </button>
        </div>

        <div className="astek-modal-body">
          {/* Description */}
          <div className="import-description">
            <p>{config.description}</p>
          </div>

          {/* Télécharger modèle */}
          <div className="import-template-section">
            <h4>📄 Étape 1 : Télécharger le modèle</h4>
            <p>Téléchargez le fichier modèle avec les colonnes attendues :</p>
            <button
              className="astek-btn astek-btn-secondary"
              onClick={handleDownloadTemplate}
              disabled={isImporting}
            >
              📥 Télécharger le modèle ({config.templateFileName})
            </button>
          </div>

          {/* Colonnes attendues */}
          <div className="import-columns-section">
            <h4>📋 Colonnes attendues</h4>
            <div className="import-columns-grid">
              {config.columns.map(col => renderColumnBadge(col))}
            </div>
          </div>

          {/* Upload fichier */}
          <div className="import-upload-section">
            <h4>📤 Étape 2 : Importer votre fichier</h4>
            <div
              className={`import-upload-zone ${isDragging ? 'import-upload-zone-dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !selectedFile && document.getElementById('import-file-input')?.click()}
            >
              {!selectedFile ? (
                <div className="import-upload-content">
                  <div className="import-upload-icon">📁</div>
                  <p className="import-upload-text">
                    Glissez-déposez votre fichier ici ou cliquez pour parcourir
                  </p>
                  <p className="import-upload-formats">
                    Formats acceptés: {acceptedFormats.join(', ')}
                  </p>
                </div>
              ) : (
                <div className="import-file-selected">
                  <div className="import-file-icon">📄</div>
                  <div className="import-file-info">
                    <div className="import-file-name">{selectedFile.name}</div>
                    <div className="import-file-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <button
                    className="import-file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    disabled={isImporting}
                    title="Supprimer le fichier"
                  >
                    ✖
                  </button>
                </div>
              )}
              <input
                id="import-file-input"
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                disabled={isImporting}
              />
            </div>
          </div>
        </div>

        <div className="astek-modal-footer">
          <button
            className="astek-btn astek-btn-secondary"
            onClick={onClose}
            disabled={isImporting}
          >
            Annuler
          </button>
          <button
            className="astek-btn astek-btn-primary"
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? '⏳ Import en cours...' : '🚀 Lancer l\'import'}
          </button>
        </div>
      </div>
    </div>
  );
};
