import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import type { BusinessUnitDto } from '../services/businessUnitsApi';
import {
  getBusinessUnits as fetchBusinessUnits,
  createBusinessUnit as apiCreateBusinessUnit,
  updateBusinessUnit as apiUpdateBusinessUnit,
  deleteBusinessUnit as apiDeleteBusinessUnit,
} from '../services/businessUnitsApi';
import { hasAnyRole } from '../utils/roleHelpers';
import { BusinessUnitFormModalNew, type BusinessUnitFormValues } from '../components/BusinessUnitFormModalNew';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';

export const BusinessUnitsPageNew = () => {
  const { user } = useAuth0();
  
  // State
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnitDto | null>(null);
  
  // Permissions
  const canManageBusinessUnits = hasAnyRole(user, ['Admin', 'CFO']);

  // Load business units on mount
  useEffect(() => {
    loadBusinessUnits();
  }, []);

  const loadBusinessUnits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchBusinessUnits();
      setBusinessUnits(data);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Erreur lors du chargement des Business Units';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedBusinessUnit(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (businessUnit: BusinessUnitDto) => {
    setSelectedBusinessUnit(businessUnit);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusinessUnit(null);
  };

  const handleSaveBusinessUnit = async (data: BusinessUnitFormValues) => {
    try {
      if (modalMode === 'create') {
        const newBusinessUnit = await apiCreateBusinessUnit(data);
        setBusinessUnits(prev => [...prev, newBusinessUnit]);
        toast.success(`Business Unit "${newBusinessUnit.name}" (${newBusinessUnit.code}) créée avec succès !`);
      } else {
        if (!selectedBusinessUnit) return;
        
        const updatedBusinessUnit = await apiUpdateBusinessUnit(selectedBusinessUnit.id, data);
        setBusinessUnits(prev =>
          prev.map(bu => bu.id === updatedBusinessUnit.id ? updatedBusinessUnit : bu)
        );
        toast.success(`Business Unit "${updatedBusinessUnit.name}" mise à jour !`);
      }
      
      handleCloseModal();
    } catch (error) {
      toast.error((error as Error).message);
      throw error; // Re-throw to keep modal open
    }
  };

  const handleDeleteBusinessUnit = async (businessUnit: BusinessUnitDto) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la Business Unit "${businessUnit.name}" (${businessUnit.code}) ?\n\n` +
      `Cette action détachera tous les secteurs assignés à cette Business Unit.`
    );
    
    if (!confirmed) return;
    
    try {
      await apiDeleteBusinessUnit(businessUnit.id);
      setBusinessUnits(prev => prev.filter(bu => bu.id !== businessUnit.id));
      toast.success(`Business Unit "${businessUnit.name}" supprimée.`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Define columns for DataTable
  const columns: DataTableColumn<BusinessUnitDto>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Nom',
      width: '25%',
      accessor: (bu) => <strong>{bu.name}</strong>,
    },
    {
      id: 'code',
      label: 'Code',
      width: '12%',
      accessor: (bu) => (
        <code style={{ 
          background: '#E5E7EB', 
          padding: '4px 10px', 
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#4B5563'
        }}>
          {bu.code}
        </code>
      ),
    },
    {
      id: 'sectors',
      label: 'Secteurs',
      width: '25%',
      accessor: (bu) => {
        if (bu.sectors.length === 0) {
          return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Aucun secteur</span>;
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {bu.sectors.map(sector => (
              <span
                key={sector.id}
                style={{
                  padding: '2px 8px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {sector.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'managerName',
      label: 'Responsable',
      width: '20%',
      accessor: (bu) => bu.managerName,
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '18%',
      searchable: false,
      accessor: (bu) => canManageBusinessUnits ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleOpenEditModal(bu)}
            className="astek-btn astek-btn-ghost"
            style={{ 
              padding: '6px 12px', 
              minHeight: 'auto', 
              fontSize: '13px',
            }}
            title="Modifier la Business Unit"
          >
            ✏️ Modifier
          </button>
          <button
            onClick={() => handleDeleteBusinessUnit(bu)}
            className="astek-btn astek-btn-ghost"
            style={{ 
              padding: '6px 12px', 
              minHeight: 'auto', 
              fontSize: '13px',
              color: '#DC2626',
            }}
            title="Supprimer la Business Unit"
          >
            🗑️
          </button>
        </div>
      ) : null,
    },
  ], [canManageBusinessUnits]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="astek-page">
        <div className="astek-alert astek-alert-danger">
          Erreur lors du chargement des Business Units: {error}
          <button
            onClick={loadBusinessUnits}
            className="astek-btn astek-btn-secondary"
            style={{ marginTop: '12px' }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="astek-page">
      <div className="astek-page-header">
        <div>
          <h1 className="astek-page-title">Business Units</h1>
          <p className="astek-page-subtitle">
            Gérer les unités organisationnelles, leurs secteurs et responsables
          </p>
        </div>
        {canManageBusinessUnits && (
          <button
            className="astek-btn astek-btn-primary"
            onClick={handleOpenCreateModal}
          >
            + Nouvelle Business Unit
          </button>
        )}
      </div>

      {businessUnits.length === 0 ? (
        <div className="astek-alert astek-alert-info">
          Aucune Business Unit trouvée. 
          {canManageBusinessUnits && ' Cliquez sur le bouton ci-dessus pour en créer une.'}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={businessUnits}
          pageSizeOptions={[10, 25, 50]}
          defaultPageSize={10}
        />
      )}

      {/* Business Unit Form Modal */}
      <BusinessUnitFormModalNew
        isOpen={isModalOpen}
        mode={modalMode}
        initialBusinessUnit={selectedBusinessUnit || undefined}
        onClose={handleCloseModal}
        onSave={handleSaveBusinessUnit}
      />
    </div>
  );
};
