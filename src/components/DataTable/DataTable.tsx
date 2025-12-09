import React, { useState, useMemo } from 'react';
import './DataTable.css';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface DataTableColumn<T> {
  id: string;
  label: string;
  accessor: (row: T) => React.ReactNode;
  width?: string;
  searchable?: boolean;
  searchType?: 'text' | 'select';
  searchOptions?: { value: string; label: string }[];
}

export interface DataTableProps<T> {
  title?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowClick?: (row: T) => void;
}

// ============================================================================
// useColumnFilters Hook
// ============================================================================

interface FilterState {
  [columnId: string]: string;
}

function useColumnFilters<T>(
  columns: DataTableColumn<T>[],
  data: T[]
) {
  const [searchValues, setSearchValues] = useState<FilterState>({});
  const [debouncedValues, setDebouncedValues] = useState<FilterState>({});

  // Debounce timer ref
  const timers = useMemo(() => new Map<string, ReturnType<typeof setTimeout>>(), []);

  const handleSearchChange = (columnId: string, value: string) => {
    setSearchValues(prev => ({ ...prev, [columnId]: value }));

    // Clear existing timer for this column
    const existingTimer = timers.get(columnId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer (300ms)
    const column = columns.find(c => c.id === columnId);
    if (column?.searchType === 'text') {
      const timer = setTimeout(() => {
        setDebouncedValues(prev => ({ ...prev, [columnId]: value }));
      }, 300);
      timers.set(columnId, timer);
    } else {
      // For select, update immediately
      setDebouncedValues(prev => ({ ...prev, [columnId]: value }));
    }
  };

  // Filter data based on all active filters (AND logic)
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return columns.every(column => {
        if (!column.searchable) return true;

        const filterValue = debouncedValues[column.id];
        if (!filterValue) return true;

        const cellContent = column.accessor(row);
        
        // Extract text content from React nodes
        let textContent = '';
        if (typeof cellContent === 'string' || typeof cellContent === 'number') {
          textContent = String(cellContent);
        } else if (React.isValidElement(cellContent)) {
          // Extract text from React elements (simple approach)
          textContent = extractTextFromElement(cellContent);
        }

        return textContent.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, columns, debouncedValues]);

  return {
    filteredData,
    searchValues,
    handleSearchChange,
  };
}

// Helper to extract text from React elements
function extractTextFromElement(element: React.ReactElement): string {
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return String(element);
  
  const props = element.props as Record<string, unknown>;
  if (props && 'children' in props) {
    const children = props.children;
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return children.map(child => 
        typeof child === 'string' ? child : 
        React.isValidElement(child) ? extractTextFromElement(child) : ''
      ).join(' ');
    }
    if (React.isValidElement(children)) {
      return extractTextFromElement(children);
    }
  }
  
  return '';
}

// ============================================================================
// DataTable Component
// ============================================================================

export function DataTable<T>({
  title,
  columns,
  data,
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Use column filters hook
  const { filteredData, searchValues, handleSearchChange } = useColumnFilters(columns, data);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="data-table-card">
      {title && <h2 className="data-table-title">{title}</h2>}
      
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr className="data-table-header-row">
              {columns.map(column => (
                <th
                  key={column.id}
                  className="data-table-header-cell"
                  style={{ width: column.width }}
                >
                  <div className="data-table-header-content">
                    <div className="data-table-header-label">
                      {column.label}
                    </div>
                    {column.searchable !== false && (
                      <div className="data-table-filter">
                        {column.searchType === 'select' && column.searchOptions ? (
                          <select
                            className="data-table-filter-select"
                            value={searchValues[column.id] || ''}
                            onChange={(e) => handleSearchChange(column.id, e.target.value)}
                          >
                            <option value="">Tous</option>
                            {column.searchOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="data-table-filter-input"
                            placeholder="Rechercher..."
                            value={searchValues[column.id] || ''}
                            onChange={(e) => handleSearchChange(column.id, e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="data-table-empty"
                >
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`data-table-row ${onRowClick ? 'data-table-row-clickable' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <td key={column.id} className="data-table-cell">
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="data-table-pagination">
          <div className="data-table-pagination-info">
            Affichage {startIndex + 1}–{endIndex} sur {totalItems}
          </div>
          
          <div className="data-table-pagination-controls">
            <label className="data-table-page-size-label">
              Lignes par page:
              <select
                className="data-table-page-size-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            
            <div className="data-table-pagination-buttons">
              <button
                className="data-table-pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ‹ Précédent
              </button>
              <span className="data-table-pagination-page">
                Page {currentPage} / {totalPages}
              </span>
              <button
                className="data-table-pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Suivant ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
