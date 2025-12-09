import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '../utils/validationSchemas';
import { Country, Currency } from '../types';
import { useCreateClient } from '../hooks/useApi';
import { useState } from 'react';

interface CreateClientModalProps {
  show: boolean;
  onHide: () => void;
  onClientCreated?: (clientId: string) => void;
}

export const CreateClientModal = ({ show, onHide, onClientCreated }: CreateClientModalProps) => {
  const [serverError, setServerError] = useState<string>('');
  const createClient = useCreateClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      code: '',
      sector: '',
      country: Country.CANADA,
      defaultCurrency: Currency.CAD,
      defaultTargetMargin: 25,
      defaultMinMargin: 15,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setServerError('');
    try {
      const newClient = await createClient.mutateAsync(data);
      reset();
      onClientCreated?.(newClient.id);
      onHide();
    } catch (error) {
      setServerError((error as Error).message);
    }
  };

  const handleClose = () => {
    reset();
    setServerError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Créer un nouveau client</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {serverError && (
            <Alert variant="danger" dismissible onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Row className="mb-3">
            <Col xs={12} md={8}>
              <Form.Group>
                <Form.Label>Nom du client <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="text"
                      isInvalid={!!errors.name}
                      placeholder="Ex: Acme Corporation"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Code client</Form.Label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="text"
                      isInvalid={!!errors.code}
                      placeholder="Ex: ACME"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Secteur d'activité</Form.Label>
                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="text"
                      isInvalid={!!errors.sector}
                      placeholder="Ex: Technologie"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sector?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Pays <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.country}>
                      {Object.values(Country).map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.country?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Devise <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="defaultCurrency"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.defaultCurrency}>
                      {Object.values(Currency).map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.defaultCurrency?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Marge cible (%) <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="defaultTargetMargin"
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <Form.Control
                      {...field}
                      type="number"
                      step="0.1"
                      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.defaultTargetMargin}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.defaultTargetMargin?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Marge minimale (%) <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="defaultMinMargin"
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <Form.Control
                      {...field}
                      type="number"
                      step="0.1"
                      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.defaultMinMargin}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.defaultMinMargin?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="mb-3">Contact principal (optionnel)</h6>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Controller
                  name="contactName"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="text"
                      isInvalid={!!errors.contactName}
                      placeholder="Ex: John Doe"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Email</Form.Label>
                <Controller
                  name="contactEmail"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="email"
                      isInvalid={!!errors.contactEmail}
                      placeholder="email@exemple.com"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactEmail?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Téléphone</Form.Label>
                <Controller
                  name="contactPhone"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="tel"
                      isInvalid={!!errors.contactPhone}
                      placeholder="+1 514 555-0100"
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPhone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes / Conditions particulières</Form.Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  as="textarea"
                  rows={3}
                  isInvalid={!!errors.notes}
                  placeholder="Informations supplémentaires..."
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.notes?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting} className="w-100 w-sm-auto order-2 order-sm-1">
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100 w-sm-auto order-1 order-sm-2">
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Création...
              </>
            ) : (
              'Créer le client'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
