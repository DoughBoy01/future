import { useState, useEffect } from 'react';
import { Edit2, Trash2, Copy, ChevronUp, ChevronDown, Search, Download, Upload, RefreshCw } from 'lucide-react';
import { dataManagementService, TableConfig, FilterCondition, SortParams } from '../../services/dataManagementService';
import { RecordEditModal } from './RecordEditModal';

interface UniversalDataTableProps {
  tableConfig: TableConfig;
  onEdit?: (record: any) => void;
  onDelete?: (id: string) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  refreshTrigger?: number;
}

export function UniversalDataTable({
  tableConfig,
  onEdit,
  onDelete,
  onBulkAction,
  refreshTrigger = 0
}: UniversalDataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sort, setSort] = useState<SortParams | undefined>(
    tableConfig.orderBy ? { column: tableConfig.orderBy.column, ascending: tableConfig.orderBy.ascending } : undefined
  );
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage, filters, sort, refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    const result = await dataManagementService.getTableData(
      tableConfig.name,
      filters,
      sort,
      { page: currentPage, pageSize }
    );

    if (result.success) {
      setData(result.data);
      setTotalCount(result.count);
    }
    setLoading(false);
  };

  const handleSort = (columnName: string) => {
    setSort(prev => {
      if (prev?.column === columnName) {
        return { column: columnName, ascending: !prev.ascending };
      }
      return { column: columnName, ascending: true };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row[tableConfig.primaryKey])));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilters([]);
      return;
    }

    const searchableColumns = tableConfig.columns
      .filter(col => col.type === 'text')
      .map(col => col.name);

    const result = await dataManagementService.searchRecords(
      tableConfig.name,
      searchTerm,
      searchableColumns
    );

    if (result.success) {
      setData(result.data);
      setTotalCount(result.data.length);
    }
  };

  const handleEdit = (record: any) => {
    if (onEdit) {
      onEdit(record);
    } else {
      setEditingRecord(record);
    }
  };

  const handleEditSuccess = () => {
    loadData();
    setEditingRecord(null);
  };

  const formatCellValue = (value: any, columnType: string) => {
    if (value === null || value === undefined) return '-';

    switch (columnType) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'json':
        return JSON.stringify(value).substring(0, 50) + '...';
      default:
        return String(value).substring(0, 100);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{tableConfig.displayName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            {onBulkAction && (
              <>
                <button
                  onClick={() => onBulkAction('import', [])}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => onBulkAction('export', [])}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {selectedRows.size > 0 && onBulkAction && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-900 font-medium">
              {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction('bulk-edit', Array.from(selectedRows))}
                className="px-3 py-1 text-sm bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
              >
                Bulk Edit
              </button>
              <button
                onClick={() => onBulkAction('bulk-delete', Array.from(selectedRows))}
                className="px-3 py-1 text-sm bg-white text-red-700 border border-red-300 rounded hover:bg-red-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No data found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {tableConfig.columns.map(column => (
                  <th
                    key={column.name}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(column.name)}
                  >
                    <div className="flex items-center gap-2">
                      {column.displayName}
                      {sort?.column === column.name && (
                        sort.ascending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(row => (
                <tr key={row[tableConfig.primaryKey]} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row[tableConfig.primaryKey])}
                      onChange={() => handleSelectRow(row[tableConfig.primaryKey])}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {tableConfig.columns.map(column => (
                    <td key={column.name} className="px-4 py-3 text-sm text-gray-900">
                      {formatCellValue(row[column.name], column.type)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const result = await dataManagementService.duplicateRecord(
                            tableConfig.name,
                            row[tableConfig.primaryKey]
                          );
                          if (result.success) {
                            loadData();
                          }
                        }}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row[tableConfig.primaryKey])}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editingRecord && (
        <RecordEditModal
          tableConfig={tableConfig}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
