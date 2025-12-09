import { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import { useBusinessUnits, useCreateBusinessUnit, useUpdateBusinessUnit, useDeleteBusinessUnit } from '../hooks/useApi';
import type { BusinessUnit } from '../types';
import { hasAnyRole } from '../utils/roleHelpers';
import { getUserBusinessUnitCodes } from '../utils/roleUtils';
import { BusinessUnitFormModal, type BusinessUnitFormValues } from '../components/BusinessUnitFormModal';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';

export const BusinessUnitsPage = () => {
  const { user } = useAuth0();
  const { data: businessUnitsDto, isLoading, error } = useBusinessUnits();
  
  // Convert DTO to frontend type - remove extra fields like sectors
  const businessUnits = useMemo(() => {
    return businessUnitsDto?.map(bu => ({
      id: String(bu.id),
      name: bu.name,
      code: bu.code,
      managerName: bu.managerName,
      isActive: bu.isActive,
      createdAt: bu.createdAt,
      updatedAt: bu.updatedAt || undefined,
    } as BusinessUnit)) || [];
  }, [businessUnitsDto]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnit | null>(null);
  
  // Local business units state for optimistic updates
  const [localBusinessUnits, setLocalBusinessUnits] = useState<BusinessUnit[]>([]);
  
  // Mutations
  const createBusinessUnit = useCreateBusinessUnit();
  const updateBusinessUnit = useUpdateBusinessUnit();
  const deleteBusinessUnit = useDeleteBusinessUnit();
  
  // Determine if user can manage business units
  const canManageBusinessUnits = hasAnyRole(user, ['Admin', 'CFO']);
  
  // Sync localBusinessUnits with businessUnits
  useMemo(() => {
    if (businessUnits.length > 0 && localBusinessUnits.length === 0) {
      setLocalBusinessUnits(businessUnits);
    }
  }, [businessUnits, localBusinessUnits.length]);

  // Filter business units based on user's BU roles
  const filteredBusinessUnits = useMemo(() => {
    const units = localBusinessUnits.length > 0 ? localBusinessUnits : businessUnits || [];
    const buCodes = getUserBusinessUnitCodes(user);
    return buCodes.length === 0
      ? units // Admin or CFO: no restriction
      : units.filter(unit =>
          buCodes.includes(unit.code)
        );
  }, [localBusinessUnits, businessUnits, user]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedBusinessUnit(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (businessUnit: BusinessUnit) => {
    setSelectedBusinessUnit(businessUnit);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusinessUnit(null);
  };

  const handleSaveBusinessUnit = async (businessUnitData: BusinessUnitFormValues) => {
    try {
      if (modalMode === 'create') {
        // Create new business unit
        const newBusinessUnitDto = await createBusinessUnit.mutateAsync({
          name: businessUnitData.name,
          managerName: businessUnitData.managerName,
          sectorIds: [], // TODO: Add sector selection in form
        });
        
        const newBusinessUnit: BusinessUnit = {
          id: String(newBusinessUnitDto.id),
          name: newBusinessUnitDto.name,
          code: newBusinessUnitDto.code,
          managerName: newBusinessUnitDto.managerName,
          isActive: newBusinessUnitDto.isActive,
          createdAt: newBusinessUnitDto.createdAt,
          updatedAt: newBusinessUnitDto.updatedAt || undefined,
        };
        
        setLocalBusinessUnits(prev => [...prev, newBusinessUnit]);
        toast.success(`Business Unit "${newBusinessUnit.name}" créée avec succès !`);
      } else {
        // Update existing business unit
        if (!businessUnitData.id) return;
        
        const updatedBusinessUnitDto = await updateBusinessUnit.mutateAsync({
          id: businessUnitData.id.toString(),
          data: {
            name: businessUnitData.name,
            managerName: businessUnitData.managerName,
            sectorIds: [], // TODO: Add sector selection in form
          },
        });
        
        const updatedBusinessUnit: BusinessUnit = {
          id: String(updatedBusinessUnitDto.id),
          name: updatedBusinessUnitDto.name,
          code: updatedBusinessUnitDto.code,
          managerName: updatedBusinessUnitDto.managerName,
          isActive: updatedBusinessUnitDto.isActive,
          createdAt: updatedBusinessUnitDto.createdAt,
          updatedAt: updatedBusinessUnitDto.updatedAt || undefined,
        };
        
        setLocalBusinessUnits(prev =>
          prev.map(bu => bu.id === updatedBusinessUnit.id ? updatedBusinessUnit : bu)
        );
        toast.success(`Business Unit "${updatedBusinessUnit.name}" mise à jour !`);
      }
      
      handleCloseModal();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteBusinessUnit = async (businessUnit: BusinessUnit) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la Business Unit "${businessUnit.name}" ?`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteBusinessUnit.mutateAsync(businessUnit.id);
      setLocalBusinessUnits(prev => prev.filter(bu => bu.id !== businessUnit.id));
      toast.success(`Business Unit "${businessUnit.name}" supprimée.`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Use local business units or API business units
  const displayBusinessUnits = localBusinessUnits.length > 0 ? localBusinessUnits : businessUnits || [];

  // Define columns for DataTable
  const columns: DataTableColumn<BusinessUnit>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Nom',
      width: '25%',
      accessor: (bu) => <strong>{bu.name}</strong>,
    },
    {
      id: 'code',
      label: 'Code',
      width: '15%',
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
      id: 'managerName',
      label: 'Responsable',
      width: '25%',
      accessor: (bu) => bu.managerName,
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '12%',
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
            🗑️ Supprimer
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
      <div className="astek-alert astek-alert-danger">
        Erreur lors du chargement des Business Units: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="astek-page">
      <div className="astek-page-header">
        <div>
          <h1 className="astek-page-title">Business Units</h1>
          <p className="astek-page-subtitle">Gérer les unités organisationnelles et leurs responsables</p>
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

      {!filteredBusinessUnits || filteredBusinessUnits.length === 0 ? (
        <div className="astek-alert astek-alert-info">
          Aucune Business Unit trouvée.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredBusinessUnits}
          pageSizeOptions={[10, 25, 50]}
          defaultPageSize={10}
        />
      )}

      {/* Business Unit Form Modal */}
      <BusinessUnitFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialBusinessUnit={selectedBusinessUnit || undefined}
        onClose={handleCloseModal}
        onSave={handleSaveBusinessUnit}
      />
    </div>
  );
};
