import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  expandable?: boolean;
  expandedRowRender?: (item: T) => React.ReactNode;
  defaultExpanded?: boolean;
  onExpandChange?: (expandedIds: Set<string>) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  expandable = false,
  expandedRowRender,
  defaultExpanded = false,
  onExpandChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    defaultExpanded ? new Set(data.map((item) => item.id)) : new Set()
  );
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
    onExpandChange?.(newSet);
  };

  const handleExpandKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded(id);
    }
  };

  const filteredData = searchable
    ? data.filter((item) => {
        const searchString = JSON.stringify(item).toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      })
    : data;

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aValue = (a as any)[sortKey];
        const bValue = (b as any)[sortKey];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc'
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      })
    : filteredData;

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {expandable && (
                <th className="px-6 py-3 w-12">
                  <span className="sr-only">Expand</span>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-gray-700"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={expandable ? columns.length + 1 : columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                return (
                  <>
                    <tr
                      key={item.id}
                      className={`${
                        onRowClick && !expandable ? 'cursor-pointer hover:bg-gray-50' : ''
                      } transition-colors`}
                    >
                      {expandable && (
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(item.id);
                            }}
                            onKeyDown={(e) => handleExpandKeyDown(e, item.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 text-sm text-gray-900"
                          onClick={() => !expandable && onRowClick?.(item)}
                        >
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && expandedRowRender && (
                      <tr key={`${item.id}-expanded`} className="bg-gray-50">
                        <td colSpan={columns.length + 1} className="px-6 py-4">
                          <div className="animate-fadeIn">
                            {expandedRowRender(item)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{' '}
            {sortedData.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
