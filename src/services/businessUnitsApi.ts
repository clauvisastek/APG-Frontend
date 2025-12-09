import { fetchWithAuth } from '../utils/authFetch';

// Base API URL - adjust as needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface SectorDto {
  id: number;
  name: string;
  isActive: boolean;
  businessUnitId: number | null;
}

export interface BusinessUnitDto {
  id: number;
  name: string;
  code: string;
  managerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  sectors: SectorDto[];
}

export interface BusinessUnitCreateUpdateDto {
  name: string;
  managerName: string;
  sectorIds: number[];
}

export interface CreateSectorDto {
  name: string;
}

/**
 * Get all business units
 */
export async function getBusinessUnits(): Promise<BusinessUnitDto[]> {
  console.log('🔍 getBusinessUnits called');
  try {
    const result = await fetchWithAuth<BusinessUnitDto[]>(`${API_BASE_URL}/api/BusinessUnits`);
    console.log('✅ getBusinessUnits success:', result);
    return result;
  } catch (error) {
    console.error('❌ getBusinessUnits error:', error);
    throw error;
  }
}

/**
 * Get Business Units accessible to the current user based on their roles
 * - Admin and CFO roles: can access all Business Units
 * - BU-specific roles (e.g., "BU-001"): can only access those specific Business Units
 */
export async function getBusinessUnitsForCurrentUser(): Promise<BusinessUnitDto[]> {
  return fetchWithAuth<BusinessUnitDto[]>(`${API_BASE_URL}/api/BusinessUnits/available-for-current-user`);
}

/**
 * Get a business unit by ID
 */
export async function getBusinessUnitById(id: number): Promise<BusinessUnitDto> {
  return fetchWithAuth<BusinessUnitDto>(`${API_BASE_URL}/api/BusinessUnits/${id}`);
}

/**
 * Create a new business unit
 */
export async function createBusinessUnit(
  data: BusinessUnitCreateUpdateDto
): Promise<BusinessUnitDto> {
  return fetchWithAuth<BusinessUnitDto>(`${API_BASE_URL}/api/BusinessUnits`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing business unit
 */
export async function updateBusinessUnit(
  id: number,
  data: BusinessUnitCreateUpdateDto
): Promise<BusinessUnitDto> {
  return fetchWithAuth<BusinessUnitDto>(`${API_BASE_URL}/api/BusinessUnits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a business unit
 */
export async function deleteBusinessUnit(id: number): Promise<void> {
  return fetchWithAuth<void>(`${API_BASE_URL}/api/BusinessUnits/${id}`, {
    method: 'DELETE',
  });
}

// Export as API object for consistency with other API modules
export const businessUnitsApi = {
  getAll: getBusinessUnits,
  getAvailableForCurrentUser: getBusinessUnitsForCurrentUser,
  getById: getBusinessUnitById,
  create: createBusinessUnit,
  update: updateBusinessUnit,
  delete: deleteBusinessUnit,
};
