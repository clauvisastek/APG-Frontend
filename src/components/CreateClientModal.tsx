import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormData } from '../utils/validationSchemas';
import { useCreateClient, useBusinessUnits, useSectors, useCountries, useCurrencies } from '../hooks/useApi';
import { useState } from 'react';

interface CreateClientModalProps {
  show: boolean;
  onHide: () => void;
  onClientCreated?: (clientId: number) => void;
}

export const CreateClientModal = ({ show, onHide, onClientCreated }: CreateClientModalProps) => {
  const [serverError, setServerError] = useState<string>('');
  const createClient = useCreateClient();
  const { data: businessUnits } = useBusinessUnits();
  const { data: sectors } = useSectors();
  const { data: countries } = useCountries();
  const { data: currencies } = useCurrencies();

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
      sectorId: 1,
      businessUnitId: 1,
      countryId: 1,
      currencyId: 1,
      defaultTargetMarginPercent: 25,
      defaultMinimumMarginPercent: 15,
      contactName: '',
      contactEmail: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setServerError('');
    try {
      // Ensure code is set even if empty
      const clientData = {
        ...data,
        code: data.code || '',
      };
      const newClient = await createClient.mutateAsync(clientData);
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
                <Form.Label>Secteur d'activité <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="sectorId"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.sectorId} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      {sectors?.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sectorId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Pays <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="countryId"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.countryId} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      {countries?.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.countryId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Devise <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="currencyId"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.currencyId} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      {currencies?.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.currencyId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Marge cible (%)</Form.Label>
                <Controller
                  name="defaultTargetMarginPercent"
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <Form.Control
                      {...field}
                      type="number"
                      step="0.1"
                      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      isInvalid={!!errors.defaultTargetMarginPercent}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.defaultTargetMarginPercent?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Marge minimale (%)</Form.Label>
                <Controller
                  name="defaultMinimumMarginPercent"
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <Form.Control
                      {...field}
                      type="number"
                      step="0.1"
                      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      isInvalid={!!errors.defaultMinimumMarginPercent}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.defaultMinimumMarginPercent?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Business Unit <span className="text-danger">*</span></Form.Label>
                <Controller
                  name="businessUnitId"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} isInvalid={!!errors.businessUnitId} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                      {businessUnits?.map((bu) => (
                        <option key={bu.id} value={bu.id}>
                          {bu.name} ({bu.code})
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.businessUnitId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="mb-3">Contact principal <span className="text-danger">*</span></h6>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
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
            <Col xs={12} md={6}>
              <Form.Group className="mt-3 mt-md-0">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
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
          </Row>
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
