import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { TableConfig } from '../../services/dataManagementService';
import { importExportService } from '../../services/importExportService';
import { dataManagementService } from '../../services/dataManagementService';

interface ExportModalProps {
  tableConfig: TableConfig;
  onClose: () => void;
}

export function ExportModal({ tableConfig, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(tableConfig.columns.map(col => col.name))
  );
  const [exporting, setExporting] = useState(false);

  const handleColumnToggle = (columnName: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(columnName)) {
      newSelected.delete(columnName);
    } else {
      newSelected.add(columnName);
    }
    setSelectedColumns(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedColumns.size === tableConfig.columns.length) {
      setSelectedColumns(new Set());
    } else {
      setSelectedColumns(new Set(tableConfig.columns.map(col => col.name)));
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await dataManagementService.getTableData(tableConfig.name);

      if (result.success && result.data.length > 0) {
        const selectedColumnConfigs = tableConfig.columns.filter(col =>
          selectedColumns.has(col.name)
        );

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'csv') {
          content = importExportService.exportToCSV(result.data, selectedColumnConfigs, {
            format: 'csv',
            columns: Array.from(selectedColumns),
            includeHeaders: true,
          });
          filename = `${tableConfig.name}_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
        } else {
          content = importExportService.exportToJSON(result.data, selectedColumnConfigs, {
            format: 'json',
            columns: Array.from(selectedColumns),
          });
          filename = `${tableConfig.name}_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
        }

        importExportService.downloadFile(content, filename, mimeType);
        onClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Export {tableConfig.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
                  className="mr-2"
                />
                <span>CSV (Excel Compatible)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
                  className="mr-2"
                />
                <span>JSON</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Columns to Export
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedColumns.size === tableConfig.columns.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {tableConfig.columns.map((column) => (
                <label
                  key={column.name}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.has(column.name)}
                    onChange={() => handleColumnToggle(column.name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{column.displayName}</div>
                    <div className="text-xs text-gray-500">{column.type}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {selectedColumns.size} column{selectedColumns.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || selectedColumns.size === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
