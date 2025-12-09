import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientDto, type ClientCreateUpdateDto } from '../services/clientsApi';
import { countriesApi, type CountryDto, type CountryCreateDto } from '../services/countriesApi';
import { currenciesApi, type CurrencyDto, type CurrencyCreateDto } from '../services/currenciesApi';
import { businessUnitsApi, type BusinessUnitDto } from '../services/businessUnitsApi';

// ============================================================================
// CLIENTS HOOKS
// ============================================================================

/**
 * Fetch all clients (filtered by user's accessible Business Units on backend)
 */
export const useClientsQuery = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a single client by ID
 */
export const useClientQuery = (id: number | null) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id!),
    enabled: id !== null,
  });
};

/**
 * Create a new client
 */
export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientCreateUpdateDto) => clientsApi.create(data),
    onSuccess: async () => {
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.refetchQueries({ queryKey: ['clients'] });
    },
  });
};

/**
 * Update an existing client
 */
export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientCreateUpdateDto }) =>
      clientsApi.update(id, data),
    onSuccess: async (_, variables) => {
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
      
      // Force immediate refetch with a small delay to ensure backend has committed
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['clients'], type: 'active' });
      }, 100);
    },
  });
};

/**
 * Delete a client
 */
export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// ============================================================================
// COUNTRIES HOOKS
// ============================================================================

/**
 * Fetch all active countries
 */
export const useCountriesQuery = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes (reference data changes rarely)
  });
};

/**
 * Create a new country
 */
export const useCreateCountryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CountryCreateDto) => countriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// ============================================================================
// CURRENCIES HOOKS
// ============================================================================

/**
 * Fetch all active currencies
 */
export const useCurrenciesQuery = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => currenciesApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Create a new currency
 */
export const useCreateCurrencyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CurrencyCreateDto) => currenciesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
  });
};

// ============================================================================
// BUSINESS UNITS HOOKS
// ============================================================================

/**
 * Fetch Business Units accessible to the current user
 * - Admin and CFO: all Business Units
 * - BU-specific roles: only their BUs
 */
export const useAccessibleBusinessUnitsQuery = () => {
  return useQuery({
    queryKey: ['business-units', 'accessible'],
    queryFn: () => businessUnitsApi.getAvailableForCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch all Business Units (admin only)
 */
export const useAllBusinessUnitsQuery = () => {
  return useQuery({
    queryKey: ['business-units', 'all'],
    queryFn: () => businessUnitsApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// TYPES RE-EXPORTS (for convenience)
// ============================================================================

export type {
  ClientDto,
  ClientCreateUpdateDto,
  CountryDto,
  CountryCreateDto,
  CurrencyDto,
  CurrencyCreateDto,
  BusinessUnitDto,
};
