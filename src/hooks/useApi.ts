import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi, projectApi, projectChangeRequestApi } from '../services/api';
import { businessUnitsApi, type BusinessUnitCreateUpdateDto } from '../services/businessUnitsApi';
import { countriesApi } from '../services/countriesApi';
import { currenciesApi } from '../services/currenciesApi';
import { sectorsApi } from '../services/sectorsApi';
import type { CreateClientInput, CreateProjectInput, EditProjectProfitabilityPayload } from '../types';

// Client hooks
export const useClients = (buId?: number) => {
  return useQuery({
    queryKey: ['clients', buId],
    queryFn: () => clientApi.getAll(buId),
  });
};

export const useClientSearch = (searchQuery: string, enabled = true) => {
  return useQuery({
    queryKey: ['clients', 'search', searchQuery],
    queryFn: () => clientApi.search(searchQuery),
    enabled: enabled && searchQuery.length > 0,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClientInput) => clientApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Project hooks
export const useProjects = (buId?: string) => {
  return useQuery({
    queryKey: ['projects', buId],
    queryFn: () => projectApi.getAll(buId),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Business Unit hooks
export const useBusinessUnits = () => {
  return useQuery({
    queryKey: ['businessUnits'],
    queryFn: businessUnitsApi.getAll,
  });
};

// Sectors hooks
export const useSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: sectorsApi.getAll,
  });
};

// Countries hooks
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; isoCode: string }) => countriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// Currencies hooks
export const useCurrencies = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: currenciesApi.getAll,
  });
};

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; code: string; symbol: string }) => currenciesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
  });
};

export const useCreateBusinessUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BusinessUnitCreateUpdateDto) => businessUnitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessUnits'] });
    },
  });
};

export const useUpdateBusinessUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BusinessUnitCreateUpdateDto }) =>
      businessUnitsApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessUnits'] });
    },
  });
};

export const useDeleteBusinessUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => businessUnitsApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessUnits'] });
    },
  });
};

// Project Change Request hooks
export const useSubmitProjectEditForValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      previousValues,
      newValues,
      userEmail,
      approverEmail,
    }: {
      projectId: string;
      previousValues: EditProjectProfitabilityPayload;
      newValues: EditProjectProfitabilityPayload;
      userEmail: string;
      approverEmail: string;
    }) => projectChangeRequestApi.submitEditForValidation(projectId, previousValues, newValues, userEmail, approverEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectChangeRequests'] });
    },
  });
};

export const useUpdateProjectNonCritical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        name?: string;
        code?: string;
        startDate?: string;
        endDate?: string;
        notes?: string;
      };
    }) => projectApi.updateNonCritical(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useProjectChangeRequests = () => {
  return useQuery({
    queryKey: ['projectChangeRequests'],
    queryFn: projectChangeRequestApi.getAll,
  });
};

export const useProjectChangeRequestsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['projectChangeRequests', projectId],
    queryFn: () => projectChangeRequestApi.getByProjectId(projectId),
    enabled: !!projectId,
  });
};
