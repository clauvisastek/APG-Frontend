import { useState } from 'react';
import type { GlobalCostsConfig, ClientMarginConfig } from '../types/calculette';

interface CfoConfigSectionProps {
  globalCosts: GlobalCostsConfig;
  clientConfigs: ClientMarginConfig[];
  onUpdateGlobalCosts: (config: GlobalCostsConfig) => Promise<void>;
  onUpdateClientConfig: (clientId: string, config: Partial<ClientMarginConfig>) => Promise<void>;
  loading?: boolean;
}

export const CfoConfigSection: React.FC<CfoConfigSectionProps> = ({
  globalCosts,
  clientConfigs,
  onUpdateGlobalCosts,
  onUpdateClientConfig,
  loading = false,
}) => {
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [globalForm, setGlobalForm] = useState<GlobalCostsConfig>(globalCosts);
  
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientMarginConfig | null>(null);
  const [clientForm, setClientForm] = useState<Partial<ClientMarginConfig>>({});

  const handleSaveGlobal = async () => {
    await onUpdateGlobalCosts(globalForm);
    setEditingGlobal(false);
  };

  const handleCancelGlobal = () => {
    setGlobalForm(globalCosts);
    setEditingGlobal(false);
  };

  const handleEditClient = (client: ClientMarginConfig) => {
    setEditingClient(client);
    setClientForm({
      margeCible: client.margeCible,
      vendantCibleHoraire: client.vendantCibleHoraire,
    });
    setShowClientModal(true);
  };

  const handleSaveClient = async () => {
    if (editingClient) {
      await onUpdateClientConfig(editingClient.clientId, clientForm);
      setShowClientModal(false);
      setEditingClient(null);
      setClientForm({});
    }
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
    setClientForm({});
  };

  return (
    <>
      {/* Configuration globale */}
      <div className="astek-card" style={{ marginTop: '24px' }}>
        <div className="calculette-cfo-section">
          <div className="calculette-cfo-header">
            <div>
              <h3 className="calculette-section-title">Paramètres globaux – Salariés</h3>
              <p className="calculette-section-subtitle">
                Configuration des coûts salariés utilisés pour les calculs de marge
              </p>
            </div>
            {!editingGlobal && (
              <button
                className="astek-btn astek-btn-secondary"
                onClick={() => setEditingGlobal(true)}
                disabled={loading}
              >
                Modifier
              </button>
            )}
          </div>

          <div className="calculette-form-grid">
            <div className="astek-form-group">
              <label className="astek-label">
                Charges patronales (%)
                <span className="calculette-tooltip" title="Pourcentage des charges patronales appliquées sur le salaire brut">
                  ℹ️
                </span>
              </label>
              <input
                type="number"
                className="astek-input"
                value={editingGlobal ? globalForm.chargesPatronales : globalCosts.chargesPatronales}
                onChange={(e) => setGlobalForm({ ...globalForm, chargesPatronales: parseFloat(e.target.value) })}
                disabled={!editingGlobal}
                step="0.1"
              />
            </div>

            <div className="astek-form-group">
              <label className="astek-label">
                Coûts indirects annuels ($)
                <span className="calculette-tooltip" title="Coûts fixes annuels par employé (équipement, licences, assurances, etc.)">
                  ℹ️
                </span>
              </label>
              <input
                type="number"
                className="astek-input"
                value={editingGlobal ? globalForm.coutsIndirects : globalCosts.coutsIndirects}
                onChange={(e) => setGlobalForm({ ...globalForm, coutsIndirects: parseFloat(e.target.value) })}
                disabled={!editingGlobal}
              />
            </div>

            <div className="astek-form-group">
              <label className="astek-label">
                Heures facturables/an
                <span className="calculette-tooltip" title="Nombre d'heures facturables par an utilisé pour calculer le coût horaire">
                  ℹ️
                </span>
              </label>
              <input
                type="number"
                className="astek-input"
                value={editingGlobal ? globalForm.heuresFacturablesParAn : globalCosts.heuresFacturablesParAn}
                onChange={(e) => setGlobalForm({ ...globalForm, heuresFacturablesParAn: parseFloat(e.target.value) })}
                disabled={!editingGlobal}
              />
            </div>
          </div>

          {editingGlobal && (
            <div className="calculette-form-actions">
              <button
                className="astek-btn astek-btn-primary"
                onClick={handleSaveGlobal}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="astek-spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
              <button
                className="astek-btn astek-btn-secondary"
                onClick={handleCancelGlobal}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Configuration par client */}
      <div className="astek-card" style={{ marginTop: '24px' }}>
        <div className="calculette-cfo-section">
          <h3 className="calculette-section-title">Paramètres par client</h3>
          <p className="calculette-section-subtitle">
            Configuration des marges cibles et vendants recommandés par client
          </p>

          <div className="astek-table-container">
            <table className="astek-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Marge cible</th>
                  <th>Vendant cible</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientConfigs.map((client) => (
                  <tr key={client.clientId}>
                    <td>{client.clientName}</td>
                    <td>
                      <span className="calculette-badge calculette-badge-primary">
                        {client.margeCible} %
                      </span>
                    </td>
                    <td>
                      {client.vendantCibleHoraire ? (
                        `${client.vendantCibleHoraire.toFixed(2)} $`
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Non défini</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="astek-btn astek-btn-sm astek-btn-secondary"
                        onClick={() => handleEditClient(client)}
                        disabled={loading}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clientConfigs.length === 0 && (
              <div className="astek-empty-state">
                <p>Aucun client configuré</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'édition client */}
      {showClientModal && editingClient && (
        <div className="astek-modal-overlay" onClick={handleCloseClientModal}>
          <div className="astek-modal" onClick={(e) => e.stopPropagation()}>
            <div className="astek-modal-header">
              <h3>Modifier les paramètres - {editingClient.clientName}</h3>
              <button
                className="astek-modal-close"
                onClick={handleCloseClientModal}
              >
                ✕
              </button>
            </div>
            <div className="astek-modal-body">
              <div className="astek-form-group">
                <label className="astek-label">Marge cible (%)</label>
                <input
                  type="number"
                  className="astek-input"
                  value={clientForm.margeCible || ''}
                  onChange={(e) => setClientForm({ ...clientForm, margeCible: parseFloat(e.target.value) })}
                  step="0.1"
                  placeholder="Ex: 25"
                />
                <p className="astek-form-help">
                  Marge cible en pourcentage pour ce client
                </p>
              </div>

              <div className="astek-form-group">
                <label className="astek-label">Vendant cible ($/h) - Optionnel</label>
                <input
                  type="number"
                  className="astek-input"
                  value={clientForm.vendantCibleHoraire || ''}
                  onChange={(e) => setClientForm({ ...clientForm, vendantCibleHoraire: parseFloat(e.target.value) || undefined })}
                  step="1"
                  placeholder="Ex: 120"
                />
                <p className="astek-form-help">
                  Vendant horaire cible suggéré pour atteindre la marge souhaitée
                </p>
              </div>
            </div>
            <div className="astek-modal-footer">
              <button
                className="astek-btn astek-btn-secondary"
                onClick={handleCloseClientModal}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="astek-btn astek-btn-primary"
                onClick={handleSaveClient}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="astek-spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="mb-1">
                <i className="bi bi-gear-fill me-2"></i>
                Paramètres globaux (CFO uniquement)
              </Card.Title>
              <small className="text-muted">
                Configuration des coûts salariés utilisés pour les calculs de marge
              </small>
            </div>
            {!editingGlobal && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => setEditingGlobal(true)}
                disabled={loading}
              >
                <i className="bi bi-pencil me-2"></i>
                Modifier
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Charges patronales (%)
                  <i
                    className="bi bi-info-circle ms-2 text-muted"
                    title="Pourcentage des charges patronales appliquées sur le salaire brut"
                  ></i>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={editingGlobal ? globalForm.chargesPatronales : globalCosts.chargesPatronales}
                  onChange={(e) => setGlobalForm({ ...globalForm, chargesPatronales: parseFloat(e.target.value) })}
                  disabled={!editingGlobal}
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Coûts indirects annuels ($)
                  <i
                    className="bi bi-info-circle ms-2 text-muted"
                    title="Coûts fixes annuels par employé (équipement, licences, assurances, etc.)"
                  ></i>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={editingGlobal ? globalForm.coutsIndirects : globalCosts.coutsIndirects}
                  onChange={(e) => setGlobalForm({ ...globalForm, coutsIndirects: parseFloat(e.target.value) })}
                  disabled={!editingGlobal}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Heures facturables/an
                  <i
                    className="bi bi-info-circle ms-2 text-muted"
                    title="Nombre d'heures facturables par an utilisé pour calculer le coût horaire"
                  ></i>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={editingGlobal ? globalForm.heuresFacturablesParAn : globalCosts.heuresFacturablesParAn}
                  onChange={(e) => setGlobalForm({ ...globalForm, heuresFacturablesParAn: parseFloat(e.target.value) })}
                  disabled={!editingGlobal}
                />
              </Form.Group>
            </Col>
          </Row>

          {editingGlobal && (
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={handleSaveGlobal}
                disabled={loading}
              >
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelGlobal}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Annuler
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Configuration par client */}
      <Card className="mb-4 border-warning">
        <Card.Header className="bg-warning bg-opacity-10">
          <Card.Title className="mb-0">
            <i className="bi bi-building me-2"></i>
            Paramètres par client (CFO uniquement)
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Client</th>
                <th>Marge cible (%)</th>
                <th>Vendant cible ($/h)</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientConfigs.map((client) => (
                <tr key={client.clientId}>
                  <td className="align-middle">{client.clientName}</td>
                  <td className="align-middle">
                    <span className="badge bg-primary">{client.margeCible} %</span>
                  </td>
                  <td className="align-middle">
                    {client.vendantCibleHoraire ? (
                      new Intl.NumberFormat('fr-CA', {
                        style: 'currency',
                        currency: 'CAD',
                      }).format(client.vendantCibleHoraire)
                    ) : (
                      <span className="text-muted">Non défini</span>
                    )}
                  </td>
                  <td className="text-center align-middle">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      disabled={loading}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {clientConfigs.length === 0 && (
            <div className="text-center text-muted py-4">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              Aucun client configuré
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal d'édition client */}
      <Modal show={showClientModal} onHide={handleCloseClientModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Modifier les paramètres - {editingClient?.clientName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Marge cible (%)</Form.Label>
              <Form.Control
                type="number"
                value={clientForm.margeCible || ''}
                onChange={(e) => setClientForm({ ...clientForm, margeCible: parseFloat(e.target.value) })}
                step="0.1"
                placeholder="Ex: 25"
              />
              <Form.Text className="text-muted">
                Marge cible en pourcentage pour ce client
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vendant cible ($/h) - Optionnel</Form.Label>
              <Form.Control
                type="number"
                value={clientForm.vendantCibleHoraire || ''}
                onChange={(e) => setClientForm({ ...clientForm, vendantCibleHoraire: parseFloat(e.target.value) || undefined })}
                step="1"
                placeholder="Ex: 120"
              />
              <Form.Text className="text-muted">
                Vendant horaire cible suggéré pour atteindre la marge souhaitée
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientModal} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveClient} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
