import { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { TableConfig, ColumnConfig } from '../../services/dataManagementService';
import { dataManagementService } from '../../services/dataManagementService';

interface BulkEditModalProps {
  tableConfig: TableConfig;
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkEditModal({ tableConfig, selectedIds, onClose, onSuccess }: BulkEditModalProps) {
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editableColumns = tableConfig.columns.filter(col => col.editable !== false);

  const handleFieldChange = (columnName: string, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    const fieldsToUpdate = Object.keys(updates).filter(key => updates[key] !== undefined);

    if (fieldsToUpdate.length === 0) {
      setError('Please select at least one field to update');
      return;
    }

    setSaving(true);

    try {
      console.log('Bulk updating records:', {
        table: tableConfig.name,
        count: selectedIds.length,
        updates
      });

      const result = await dataManagementService.bulkUpdate(
        tableConfig.name,
        selectedIds,
        updates
      );

      if (result.success) {
        console.log('Bulk update successful:', result);
        setSuccessMessage(result.message || `${result.count} records updated successfully`);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        console.error('Bulk update failed:', result.error);
        setError(result.error || 'Failed to update records');
      }
    } catch (err: any) {
      console.error('Bulk update error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (column: ColumnConfig) => {
    const value = updates[column.name] ?? '';

    switch (column.type) {
      case 'boolean':
        return (
          <select
            value={value === '' ? '' : value ? 'true' : 'false'}
            onChange={(e) => handleFieldChange(column.name, e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Leave unchanged</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'enum':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Leave unchanged</option>
            {column.enumValues?.map(enumValue => (
              <option key={enumValue} value={enumValue}>
                {enumValue}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Leave unchanged"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleFieldChange(column.name, e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value || undefined)}
            placeholder="Leave unchanged"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Edit {selectedIds.length} Records
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Update Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              Fields left empty will remain unchanged. Only modify the fields you want to update across all {selectedIds.length} selected records.
            </p>
          </div>

          <div className="space-y-4">
            {editableColumns.map(column => (
              <div key={column.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.displayName}
                  {column.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(column)}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {Object.keys(updates).filter(k => updates[k] !== undefined).length} field(s) to update
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(updates).filter(k => updates[k] !== undefined).length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : `Update ${selectedIds.length} Records`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
