import { useState, useRef } from 'react';

interface CfoImportSectionProps {
  onImport: (file: File) => Promise<void>;
  loading?: boolean;
}

export const CfoImportSection: React.FC<CfoImportSectionProps> = ({
  onImport,
  loading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    await onImport(selectedFile);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="astek-card">
      <div className="calculette-cfo-section">
        <h3 className="calculette-section-title">Import de données historiques</h3>
        <p className="calculette-section-subtitle">
          Importez un fichier Excel ou CSV contenant les paramètres de marge et vendants par client
        </p>

        <div
          className={`calculette-upload-zone ${isDragging ? 'calculette-upload-zone-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!selectedFile ? (
            <div className="calculette-upload-content">
              <div className="calculette-upload-icon">📁</div>
              <p className="calculette-upload-text">
                Glissez-déposez un fichier ici ou cliquez pour sélectionner
              </p>
              <p className="calculette-upload-formats">
                Formats acceptés: .xlsx, .xls, .csv
              </p>
            </div>
          ) : (
            <div className="calculette-file-selected">
              <div className="calculette-file-icon">📄</div>
              <div className="calculette-file-info">
                <div className="calculette-file-name">{selectedFile.name}</div>
                <div className="calculette-file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
              <button
                type="button"
                className="calculette-file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="calculette-import-actions">
            <button
              className="astek-btn astek-btn-primary"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="astek-spinner"></span>
                  Import en cours...
                </>
              ) : (
                'Lancer l\'import'
              )}
            </button>
            <button
              className="astek-btn astek-btn-secondary"
              onClick={handleRemoveFile}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        )}

        <div className="calculette-import-info">
          <h4>Format attendu du fichier</h4>
          <p>Le fichier Excel/CSV doit contenir les colonnes suivantes :</p>
          <ul>
            <li><strong>Nom du client</strong> : Nom exact du client</li>
            <li><strong>Marge cible (%)</strong> : Pourcentage de marge visé (ex: 25)</li>
            <li><strong>Vendant cible ($/h)</strong> : Tarif horaire recommandé (optionnel)</li>
          </ul>
          <p className="calculette-import-note">
            <strong>Note:</strong> Les clients existants seront mis à jour, les nouveaux seront créés.
          </p>
        </div>
      </div>
    </div>
  );
};
