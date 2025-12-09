// Base API URL - adjust as needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface SectorDto {
  id: number;
  name: string;
  isActive: boolean;
  businessUnitId: number | null;
}

export interface CreateSectorDto {
  name: string;
}

/**
 * Get all sectors
 */
export async function getAllSectors(): Promise<SectorDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/Sectors`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sectors: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get sectors available for assignment to a business unit
 * If businessUnitId is not provided, returns all unassigned sectors
 * If businessUnitId is provided, returns unassigned sectors plus sectors already assigned to that BU
 */
export async function getAvailableSectors(businessUnitId?: number): Promise<SectorDto[]> {
  const url = businessUnitId
    ? `${API_BASE_URL}/api/Sectors/available-for-business-unit/${businessUnitId}`
    : `${API_BASE_URL}/api/Sectors/available-for-business-unit`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch available sectors: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new sector
 */
export async function createSector(data: CreateSectorDto): Promise<SectorDto> {
  const response = await fetch(`${API_BASE_URL}/api/Sectors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to create sector');
  }

  return response.json();
}

export const sectorsApi = {
  getAll: getAllSectors,
  getAvailable: getAvailableSectors,
  create: createSector,
};
