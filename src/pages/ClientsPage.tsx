import { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  useClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  type ClientDto,
} from '../hooks/useClientsApi';
import type { ImportConfig } from '../types/import';
import type { Client, Country, Currency } from '../types';
import { hasAnyRole } from '../utils/roleHelpers';
import { ClientFormModal, type ClientFormValues } from '../components/ClientFormModal';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { ImportDialog } from '../components/ImportDialog';
import { importApi } from '../services/importApi';
import { toast } from 'react-toastify';
import './ClientsPage.css';

// Badge component for incomplete configuration
const IncompleteConfigBadge: React.FC<{ 
  shortText: string;
  tooltipText: string;
}> = ({ shortText, tooltipText }) => {
  return (
    <div 
      className="clients-incomplete-badge"
      style={{
        maxWidth: '160px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      title={tooltipText}
    >
      {/* Warning icon (exclamation triangle) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        style={{
          width: '14px',
          height: '14px',
          marginRight: '4px',
          flexShrink: 0,
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {shortText}
      </span>
    </div>
  );
};

// Filter mode for clients
type ClientsFilterMode = 'all' | 'incomplete';

export const ClientsPage = () => {
  const { user } = useAuth0();
  const { data: clients, isLoading, error } = useClientsQuery();
  const createClientMutation = useCreateClientMutation();
  const updateClientMutation = useUpdateClientMutation();
  const deleteClientMutation = useDeleteClientMutation();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  
  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Filter state for incomplete clients
  const [filterMode, setFilterMode] = useState<ClientsFilterMode>('all');
  
  // Determine if user can manage clients (Admin, Vente, CFO, or any BU leader)
  const canManageClients = useMemo(() => {
    if (!user) return false;
    
    // Check for specific roles
    if (hasAnyRole(user, ['Admin', 'Vente', 'CFO'])) {
      return true;
    }
    
    // Check if user has any BU role
    const userRoles = (user['https://apg-astek.com/roles'] || user['https://apg.com/roles'] || []) as string[];
    return userRoles.some(role => role.startsWith('BU-'));
  }, [user]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedClient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientDto) => {
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // Adapter to convert ClientDto to Client format for the modal
  const adaptClientDtoToClient = (dto: ClientDto | null): Client | undefined => {
    if (!dto) return undefined;
    
    return {
      id: dto.id.toString(),
      name: dto.name,
      code: dto.code,
      sectorId: dto.sectorId,
      sectorName: dto.sectorName,
      country: dto.countryName as Country, // TODO: Map properly with country codes
      defaultCurrency: dto.currencyCode as Currency,
      // Financial fields - may be undefined or null
      defaultTargetMarginPercent: dto.defaultTargetMarginPercent ?? undefined,
      defaultMinimumMarginPercent: dto.defaultMinimumMarginPercent ?? undefined,
      discountPercent: dto.discountPercent ?? undefined,
      forcedVacationDaysPerYear: dto.forcedVacationDaysPerYear ?? undefined,
      targetHourlyRate: dto.targetHourlyRate ?? undefined,
      isFinancialConfigComplete: dto.isFinancialConfigComplete ?? false,
      financialConfigStatusMessage: dto.financialConfigStatusMessage,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      businessUnit: {
        id: dto.businessUnitId.toString(),
        name: dto.businessUnitCode, // We don't have the name in DTO
        code: dto.businessUnitCode,
      },
      businessUnitCode: dto.businessUnitCode,
      createdAt: new Date().toISOString(), // Not in DTO
      updatedAt: new Date().toISOString(), // Not in DTO
    };
  };

  const handleSaveClient = async (clientData: ClientFormValues) => {
    try {
      const payload = {
        code: clientData.code,
        name: clientData.name,
        sectorId: parseInt(clientData.sectorId),
        businessUnitId: parseInt(clientData.businessUnitId),
        countryId: parseInt(clientData.country as string),
        currencyId: parseInt(clientData.defaultCurrency as string),
        // Financial fields - only include if defined
        defaultTargetMarginPercent: clientData.defaultTargetMarginPercent ?? null,
        defaultMinimumMarginPercent: clientData.defaultMinimumMarginPercent ?? null,
        discountPercent: clientData.discountPercent ?? null,
        forcedVacationDaysPerYear: clientData.forcedVacationDaysPerYear ?? null,
        targetHourlyRate: clientData.targetHourlyRate ?? null,
        contactName: clientData.contactName,
        contactEmail: clientData.contactEmail,
      };

      if (modalMode === 'create') {
        await createClientMutation.mutateAsync(payload);
        toast.success('Client créé avec succès');
      } else if (clientData.id) {
        await updateClientMutation.mutateAsync({
          id: parseInt(clientData.id),
          data: payload,
        });
        toast.success('Client mis à jour avec succès');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(modalMode === 'create' ? 'Erreur lors de la création du client' : 'Erreur lors de la mise à jour du client');
    }
  };

  const handleDeleteClient = async (client: ClientDto) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?\n\nCette action est irréversible et supprimera également tous les projets associés.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteClientMutation.mutateAsync(client.id);
        toast.success(`Client "${client.name}" supprimé avec succès`);
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Erreur lors de la suppression du client');
      }
    }
  };

  // Import handlers
  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = () => {
    // Rafraîchir la liste des clients
    // React Query refetch automatiquement
  };

  // Configuration pour l'import de clients
  const clientImportConfig: ImportConfig = {
    title: 'Import de Clients',
    description: 'Importez plusieurs clients simultanément via un fichier CSV ou Excel.',
    templateFileName: 'template_clients.csv',
    importEndpoint: '/api/clients/import',
    downloadTemplateEndpoint: '/api/clients/import/template',
    columns: [
      { name: 'code', label: 'Code Client', required: true, type: 'string', description: 'Code unique du client', example: 'CLI-001' },
      { name: 'nom', label: 'Nom du Client', required: true, type: 'string', description: 'Nom complet du client', example: 'Banque Nationale' },
      { name: 'secteur', label: 'Secteur d\'activité', required: false, type: 'string', description: 'Secteur ou industrie', example: 'Banking' },
      { name: 'pays', label: 'Pays', required: true, type: 'enum', description: 'Pays du client', example: 'Canada', enumValues: ['Canada', 'France', 'USA'] },
      { name: 'devise', label: 'Devise par défaut', required: true, type: 'enum', description: 'Devise utilisée', example: 'CAD', enumValues: ['CAD', 'USD', 'EUR'] },
      { name: 'margeCible', label: 'Marge Cible (%)', required: true, type: 'number', description: 'Marge cible en pourcentage', example: '25' },
      { name: 'margeMin', label: 'Marge Minimum (%)', required: true, type: 'number', description: 'Marge minimale acceptée', example: '15' },
      { name: 'contactNom', label: 'Nom du Contact', required: false, type: 'string', description: 'Nom du contact principal', example: 'Jean Dupont' },
      { name: 'contactEmail', label: 'Email du Contact', required: false, type: 'string', description: 'Email du contact', example: 'jean.dupont@client.com' },
      { name: 'businessUnitCode', label: 'Code Business Unit', required: true, type: 'string', description: 'Code de la BU responsable', example: 'BU-1' },
    ],
  };

  // Filtered clients based on user role
  const roleFilteredClients = useMemo(() => {
    if (!user || !clients) return [];
    
    // Admin and CFO can see all clients
    if (hasAnyRole(user, ['Admin', 'CFO'])) {
      return clients;
    }
    
    // Extract BU roles from user (roles like "BU-001", "BU-002", etc.)
    const userRoles = (user['https://apg-astek.com/roles'] || user['https://apg.com/roles'] || []) as string[];
    const userBusinessUnits = userRoles.filter(role => role.startsWith('BU-'));
    
    // If user has no BU roles, return empty array
    if (userBusinessUnits.length === 0) {
      return [];
    }
    
    // Filter clients by business unit codes
    return clients.filter((client: ClientDto) =>
      userBusinessUnits.includes(client.businessUnitCode)
    );
  }, [clients, user]);

  // Count incomplete clients (missing financial configuration)
  const incompleteClientsCount = useMemo(() => {
    return roleFilteredClients.filter((client) => !client.isFinancialConfigComplete).length;
  }, [roleFilteredClients]);

  // Apply margin completion filter
  const filteredClients = useMemo(() => {
    if (filterMode === 'incomplete') {
      return roleFilteredClients.filter((client) => !client.isFinancialConfigComplete);
    }
    return roleFilteredClients; // 'all'
  }, [roleFilteredClients, filterMode]);

  // Define columns for DataTable
  const columns: DataTableColumn<ClientDto>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Nom',
      width: '18%',
      accessor: (client) => <strong>{client.name}</strong>,
    },
    {
      id: 'code',
      label: 'Code',
      width: '10%',
      accessor: (client) => (
        <code style={{ 
          background: '#E5E7EB', 
          padding: '4px 10px', 
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#4B5563'
        }}>
          {client.code || '-'}
        </code>
      ),
    },
    {
      id: 'sector',
      label: 'Secteur',
      width: '15%',
      accessor: (client) => client.sectorName || '-',
    },
    {
      id: 'country',
      label: 'Pays',
      width: '10%',
      accessor: (client) => client.countryName || '-',
    },
    {
      id: 'businessUnit',
      label: 'Business Unit',
      width: '12%',
      accessor: (client) => (
        <span style={{
          background: '#DBEAFE',
          color: '#1E40AF',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {client.businessUnitCode}
        </span>
      ),
    },
    {
      id: 'currency',
      label: 'Devise',
      width: '8%',
      searchType: 'select',
      searchOptions: [
        { value: 'CAD', label: 'CAD' },
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
      ],
      accessor: (client) => (
        <div style={{ textAlign: 'center', fontWeight: 600 }}>
          {client.currencyCode || '-'}
        </div>
      ),
    },
    {
      id: 'margins',
      label: 'Marges par défaut',
      width: '15%',
      searchable: false,
      accessor: (client) => {
        // Use backend computed property to check if all 5 financial fields are complete
        const hasMissingFinancials = !client.isFinancialConfigComplete;
        
        // Debug log to see what we're getting
        if (client.id === 6) {
          console.log('Client 6 data:', {
            defaultTargetMarginPercent: client.defaultTargetMarginPercent,
            defaultMinimumMarginPercent: client.defaultMinimumMarginPercent,
            discountPercent: client.discountPercent,
            forcedVacationDaysPerYear: client.forcedVacationDaysPerYear,
            targetHourlyRate: client.targetHourlyRate,
            isFinancialConfigComplete: client.isFinancialConfigComplete,
            hasMissingFinancials
          });
        }
        
        // Show badge if any financial parameters are missing
        if (hasMissingFinancials) {
          return (
            <IncompleteConfigBadge
              shortText="Paramètres incomplets…"
              tooltipText={client.financialConfigStatusMessage || "Paramètres incomplets – à compléter par le CFO (marges, remises, jours de vacances forcés et vendant cible)"}
            />
          );
        }
        
        const targetMargin = client.defaultTargetMarginPercent || 0;
        const minMargin = client.defaultMinimumMarginPercent || 0;
        const marginClass = 
          targetMargin >= 25 ? 'margin-excellent' :
          targetMargin >= 20 ? 'margin-good' :
          targetMargin >= 15 ? 'margin-warning' : 'margin-danger';
        
        return (
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
              <strong>Cible:</strong> {targetMargin}% / <strong>Min:</strong> {minMargin}%
            </div>
            <div className="margin-progress-bar">
              <div 
                className={`margin-progress-fill ${marginClass}`}
                style={{ width: `${Math.min(targetMargin * 3, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'targetHourlyRate',
      label: 'Vendant cible ($/h)',
      width: '12%',
      searchable: false,
      accessor: (client) => {
        // Use backend computed property - if any of the 5 fields is missing, show badge
        const hasMissingBillRate = !client.isFinancialConfigComplete;
        
        // Show badge if bill rate is missing or invalid
        if (hasMissingBillRate) {
          return (
            <IncompleteConfigBadge
              shortText="Paramètres incomplets…"
              tooltipText={client.financialConfigStatusMessage || "Paramètres incomplets – à compléter par le CFO (marges, remises, jours de vacances forcés et vendant cible)"}
            />
          );
        }
        
        return (
          <div style={{ textAlign: 'center', fontWeight: 600, color: '#00A86B' }}>
            {client.targetHourlyRate!.toFixed(2)} $
          </div>
        );
      },
    },
    {
      id: 'contact',
      label: 'Contact',
      width: '16%',
      accessor: (client) => {
        if (!client.contactName) return '-';
        
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{client.contactName}</div>
            {client.contactEmail && (
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                <a 
                  href={`mailto:${client.contactEmail}`}
                  style={{ color: '#00A86B', textDecoration: 'none' }}
                >
                  {client.contactEmail}
                </a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '12%',
      searchable: false,
      accessor: (client) => {
        if (!canManageClients) return null;
        
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="astek-btn astek-btn-ghost"
              style={{
                padding: '6px 12px',
                minHeight: 'auto',
                fontSize: '13px',
              }}
              onClick={() => handleOpenEditModal(client)}
              title="Modifier le client"
            >
              ✏️ Modifier
            </button>
            <button
              className="astek-btn astek-btn-ghost"
              style={{
                padding: '6px 12px',
                minHeight: 'auto',
                fontSize: '13px',
                color: '#DC2626',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClient(client);
              }}
              title="Supprimer le client"
            >
              🗑️ Supprimer
            </button>
          </div>
        );
      },
    },
  ], [canManageClients]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="astek-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="astek-alert astek-alert-error">
        Erreur lors du chargement des clients: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="astek-flex-between" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="astek-page-title" style={{ marginBottom: 0 }}>Clients</h1>
          {incompleteClientsCount > 0 && (
            <span className="clients-incomplete-badge">
              Clients à compléter : {incompleteClientsCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canManageClients && (
            <>
              <button
                className="astek-btn astek-btn-secondary"
                onClick={handleOpenImport}
              >
                📥 Importer des clients
              </button>
              <button
                className="astek-btn astek-btn-primary"
                onClick={handleOpenCreateModal}
              >
                + Nouveau client
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="clients-filter-section" style={{ marginBottom: '24px' }}>
        <div className="clients-filter-toggle">
          <button
            type="button"
            className={filterMode === 'all' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilterMode('all')}
          >
            Tous les clients ({roleFilteredClients.length})
          </button>
          <button
            type="button"
            className={filterMode === 'incomplete' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilterMode('incomplete')}
          >
            Clients à compléter ({incompleteClientsCount})
          </button>
        </div>
      </div>

      {!filteredClients || filteredClients.length === 0 ? (
        <div className="astek-alert astek-alert-info">
          Aucun client trouvé.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredClients}
          pageSizeOptions={[10, 25, 50]}
          defaultPageSize={10}
        />
      )}

      {/* Client Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialClient={adaptClientDtoToClient(selectedClient)}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
      />

      {/* Import Modal */}
      <ImportDialog
        config={clientImportConfig}
        isOpen={isImportModalOpen}
        onClose={handleCloseImport}
        onImport={importApi.importClients}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
