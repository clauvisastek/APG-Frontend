import { useState } from 'react';
import { toast } from 'react-toastify';
import type { ImportResult } from '../types/calculette';

interface CalculetteCfoImportProps {
  onImport: (file: File) => Promise<ImportResult>;
  onSuccess?: () => void;
}

export const CalculetteCfoImport: React.FC<CalculetteCfoImportProps> = ({
  onImport,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedFormats = ['.xlsx', '.xls', '.csv'];

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.includes(fileExtension)) {
      toast.error(`Format de fichier non supporté. Formats acceptés: ${acceptedFormats.join(', ')}`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10 MB max
      toast.error('Le fichier est trop volumineux (max 10 MB)');
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
    if (!selectedFile) {
      toast.warning('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setIsImporting(true);
      const result = await onImport(selectedFile);

      if (result.success) {
        toast.success(result.message || `${result.linesImported} lignes importées avec succès`);
        setSelectedFile(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="astek-card">
      <div className="calculette-cfo-section">
        <div className="calculette-cfo-header">
          <div>
            <h3 className="calculette-section-title">
              Import de données Excel/CSV
            </h3>
            <p className="calculette-section-subtitle">
              Importez les marges cibles et vendants cibles par client depuis un fichier
            </p>
          </div>
        </div>

        <div
          className={`calculette-upload-zone ${isDragging ? 'calculette-upload-zone-dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {!selectedFile ? (
            <div className="calculette-upload-content">
              <div className="calculette-upload-icon">📁</div>
              <p className="calculette-upload-text">
                Glissez-déposez un fichier ici ou cliquez pour parcourir
              </p>
              <p className="calculette-upload-formats">
                Formats acceptés: {acceptedFormats.join(', ')}
              </p>
            </div>
          ) : (
            <div className="calculette-file-selected">
              <div className="calculette-file-icon">📄</div>
              <div className="calculette-file-info">
                <div className="calculette-file-name">{selectedFile.name}</div>
                <div className="calculette-file-size">{formatFileSize(selectedFile.size)}</div>
              </div>
              <button
                className="calculette-file-remove"
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
            id="file-input"
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isImporting}
          />
        </div>

        {selectedFile && (
          <div className="calculette-import-actions">
            <button
              className="astek-btn astek-btn-success"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? '📤 Import en cours...' : '📤 Lancer l\'import'}
            </button>
            <button
              className="astek-btn astek-btn-secondary"
              onClick={handleRemoveFile}
              disabled={isImporting}
            >
              ✖ Annuler
            </button>
          </div>
        )}

        <div className="calculette-import-info">
          <h4>Format attendu du fichier</h4>
          <p>
            Le fichier doit contenir les colonnes suivantes (l'ordre n'a pas d'importance):
          </p>
          <ul>
            <li><strong>client_id</strong> ou <strong>ClientID</strong>: Identifiant unique du client</li>
            <li><strong>client_name</strong> ou <strong>ClientName</strong>: Nom du client</li>
            <li><strong>marge_cible</strong> ou <strong>MargeCible</strong>: Marge cible en % (ex: 25)</li>
            <li><strong>vendant_cible</strong> ou <strong>VendantCible</strong>: Vendant cible en $/h (optionnel)</li>
          </ul>
          <div className="calculette-import-note">
            <strong>Note:</strong> Les lignes avec un client_id existant mettront à jour la configuration.
            Les nouveaux clients seront ignorés (utilisez l'interface pour créer de nouveaux clients).
          </div>
        </div>
      </div>
    </div>
  );
};
