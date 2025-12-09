import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type ProjectDto, type ProjectCreateDto, type ProjectUpdateDto } from '../services/projectsApi';

// ============================================================================
// PROJECTS HOOKS
// ============================================================================

/**
 * Fetch all projects (filtered by user's accessible Business Units on backend)
 */
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a single project by ID
 */
export const useProjectQuery = (id: number | null) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: id !== null,
  });
};

/**
 * Create a new project
 */
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreateDto) => projectsApi.create(data),
    onSuccess: async () => {
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
    },
  });
};

/**
 * Update an existing project
 */
export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdateDto }) =>
      projectsApi.update(id, data),
    onSuccess: async (_, variables) => {
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      
      // Force immediate refetch with a small delay to ensure backend has committed
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['projects'], type: 'active' });
      }, 100);
    },
  });
};

/**
 * Delete a project
 */
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Re-export types for convenience
export type { ProjectDto, ProjectCreateDto, ProjectUpdateDto };
