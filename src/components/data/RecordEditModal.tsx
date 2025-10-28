import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { TableConfig, ColumnConfig, dataManagementService } from '../../services/dataManagementService';

interface RecordEditModalProps {
  tableConfig: TableConfig;
  record: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordEditModal({ tableConfig, record, onClose, onSuccess }: RecordEditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [foreignKeyOptions, setForeignKeyOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const initialData: Record<string, any> = {};
    tableConfig.columns.forEach(col => {
      initialData[col.name] = record[col.name] ?? '';
    });
    setFormData(initialData);
    loadForeignKeyOptions();
  }, [record, tableConfig]);

  const loadForeignKeyOptions = async () => {
    const options: Record<string, any[]> = {};

    for (const column of tableConfig.columns) {
      if (column.type === 'foreign_key' && column.foreignKey) {
        const result = await dataManagementService.getForeignKeyOptions(
          column.foreignKey.table,
          column.foreignKey.display,
          column.foreignKey.column
        );

        if (result.success) {
          options[column.name] = result.data;
        }
      }
    }

    setForeignKeyOptions(options);
  };

  const handleFieldChange = (columnName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value,
    }));

    if (fieldErrors[columnName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    tableConfig.columns.forEach(column => {
      if (column.required && column.editable !== false) {
        const value = formData[column.name];
        if (value === null || value === undefined || value === '') {
          errors[column.name] = `${column.displayName} is required`;
        }
      }

      if (column.validation && formData[column.name]) {
        const validationError = column.validation(formData[column.name]);
        if (validationError) {
          errors[column.name] = validationError;
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updates: Record<string, any> = {};

      tableConfig.columns.forEach(column => {
        if (column.editable !== false) {
          const value = formData[column.name];

          if (value === '') {
            updates[column.name] = null;
          } else {
            updates[column.name] = value;
          }
        }
      });

      console.log('Updating record:', {
        table: tableConfig.name,
        id: record[tableConfig.primaryKey],
        updates
      });

      const result = await dataManagementService.updateRecord(
        tableConfig.name,
        record[tableConfig.primaryKey],
        updates
      );

      if (result.success) {
        console.log('Update successful:', result.data);
        onSuccess();
        onClose();
      } else {
        console.error('Update failed:', result.error);
        setError(result.error || 'Failed to update record');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (column: ColumnConfig) => {
    const value = formData[column.name] ?? '';
    const hasError = !!fieldErrors[column.name];

    if (column.editable === false) {
      return (
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
          {formatDisplayValue(value, column.type)}
        </div>
      );
    }

    switch (column.type) {
      case 'boolean':
        return (
          <select
            value={value === true ? 'true' : value === false ? 'false' : ''}
            onChange={(e) => handleFieldChange(column.name, e.target.value === '' ? null : e.target.value === 'true')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'enum':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value || null)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {column.enumValues?.map(enumValue => (
              <option key={enumValue} value={enumValue}>
                {enumValue}
              </option>
            ))}
          </select>
        );

      case 'foreign_key':
        if (column.foreignKey) {
          const options = foreignKeyOptions[column.name] || [];
          return (
            <select
              value={value}
              onChange={(e) => handleFieldChange(column.name, e.target.value || null)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select...</option>
              {options.map((opt: any) => (
                <option key={opt[column.foreignKey!.column]} value={opt[column.foreignKey!.column]}>
                  {opt[column.foreignKey!.display]}
                </option>
              ))}
            </select>
          );
        }
        return null;

      case 'number':
        return (
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value ? parseFloat(e.target.value) : null)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value ? (typeof value === 'string' ? value.split('T')[0] : value) : ''}
            onChange={(e) => handleFieldChange(column.name, e.target.value || null)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleFieldChange(column.name, e.target.value ? new Date(e.target.value).toISOString() : null)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(column.name, parsed);
              } catch {
                handleFieldChange(column.name, e.target.value);
              }
            }}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'text':
      default:
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(column.name, e.target.value || null)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  const formatDisplayValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  };

  const editableColumns = tableConfig.columns.filter(col => col.editable !== false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit {tableConfig.displayName} Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Update Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {editableColumns.map(column => (
              <div key={column.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.displayName}
                  {column.required && <span className="text-red-500 ml-1">*</span>}
                  {column.editable === false && <span className="text-gray-400 ml-2 text-xs">(read-only)</span>}
                </label>
                {renderField(column)}
                {fieldErrors[column.name] && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors[column.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
