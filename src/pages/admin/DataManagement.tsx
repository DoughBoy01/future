import { useState, useEffect } from 'react';
import { Database, Users, Calendar, FileText, DollarSign, Settings, AlertCircle } from 'lucide-react';
import { dataManagementService, TableConfig } from '../../services/dataManagementService';
import { UniversalDataTable } from '../../components/data/UniversalDataTable';
import { ImportModal } from '../../components/data/ImportModal';
import { ExportModal } from '../../components/data/ExportModal';
import { BulkEditModal } from '../../components/data/BulkEditModal';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export function DataManagement() {
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>([]);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configs = dataManagementService.getTableConfigs();
        if (!configs || configs.length === 0) {
          setError('No table configurations available');
        } else {
          setTableConfigs(configs);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load table configurations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Database className="w-5 h-5" />;
      case 'users':
        return <Users className="w-5 h-5" />;
      case 'operations':
        return <Calendar className="w-5 h-5" />;
      case 'content':
        return <FileText className="w-5 h-5" />;
      case 'financial':
        return <DollarSign className="w-5 h-5" />;
      case 'system':
        return <Settings className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'users':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'operations':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'content':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'financial':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'system':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const groupedTables = tableConfigs.reduce((acc, table) => {
    if (!acc[table.category]) {
      acc[table.category] = [];
    }
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, TableConfig[]>);

  const handleBulkAction = (action: string, ids: string[]) => {
    setSelectedIds(ids);

    switch (action) {
      case 'import':
        setShowImport(true);
        break;
      case 'export':
        setShowExport(true);
        break;
      case 'bulk-edit':
        setShowBulkEdit(true);
        break;
      case 'bulk-delete':
        handleBulkDelete(ids);
        break;
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!selectedTable) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${ids.length} record${ids.length > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    const result = await dataManagementService.bulkDelete(selectedTable.name, ids);
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
      alert(result.message);
    } else {
      alert(`Failed to delete records: ${result.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedTable) return;

    const confirmed = window.confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) return;

    const result = await dataManagementService.deleteRecord(selectedTable.name, id);
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
    } else {
      alert(`Failed to delete record: ${result.error}`);
    }
  };

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Data Management</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (tableConfigs.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">No Tables Configured</h3>
            <p className="text-yellow-700">No table configurations found. Please contact support.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
          <p className="text-gray-600">
            View, edit, import, and export data across all your tables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
              </div>
              <nav className="p-2">
                {Object.entries(groupedTables).map(([category, tables]) => (
                  <div key={category} className="mb-4">
                    <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider border rounded-lg ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                    <div className="mt-2 space-y-1">
                      {tables.map(table => (
                        <button
                          key={table.name}
                          onClick={() => setSelectedTable(table)}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                            selectedTable?.name === table.name
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {table.displayName}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedTable ? (
              <UniversalDataTable
                tableConfig={selectedTable}
                onDelete={handleDelete}
                onBulkAction={handleBulkAction}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Table
                </h3>
                <p className="text-gray-600">
                  Choose a table from the sidebar to view and manage its data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showImport && selectedTable && (
        <ImportModal
          tableConfig={selectedTable}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {showExport && selectedTable && (
        <ExportModal
          tableConfig={selectedTable}
          onClose={() => setShowExport(false)}
        />
      )}

      {showBulkEdit && selectedTable && selectedIds.length > 0 && (
        <BulkEditModal
          tableConfig={selectedTable}
          selectedIds={selectedIds}
          onClose={() => setShowBulkEdit(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </DashboardLayout>
  );
}
