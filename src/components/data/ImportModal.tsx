import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { TableConfig } from '../../services/dataManagementService';
import { importExportService, ImportResult } from '../../services/importExportService';
import { dataManagementService } from '../../services/dataManagementService';

interface ImportModalProps {
  tableConfig: TableConfig;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ tableConfig, onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt'))) {
      setFile(droppedFile);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const csvText = await importExportService.readFileAsText(file);
      const { headers, rows } = importExportService.parseCSV(csvText);
      const result = importExportService.validateImportData(headers, rows, tableConfig);

      setImportResult(result);
      setStep('preview');
    } catch (error: any) {
      setImportResult({
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        errors: [{ row: 0, message: error.message || 'Failed to parse file' }],
      });
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importResult?.data || importResult.data.length === 0) return;

    setProcessing(true);
    setStep('processing');

    try {
      const result = await dataManagementService.bulkInsert(
        tableConfig.name,
        importResult.data
      );

      if (result.success) {
        setStep('complete');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setImportResult({
          ...importResult,
          success: false,
          errors: [{ row: 0, message: result.error || 'Import failed' }],
        });
        setStep('preview');
      }
    } catch (error: any) {
      setImportResult({
        ...importResult,
        success: false,
        errors: [{ row: 0, message: error.message || 'Import failed' }],
      });
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = importExportService.generateCSVTemplate(tableConfig);
    importExportService.downloadFile(
      csv,
      `${tableConfig.name}_template.csv`,
      'text/csv'
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Import {tableConfig.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-1">Download Template First</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Use our CSV template to ensure your data is formatted correctly.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex justify-end">
                  <button
                    onClick={handleValidate}
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Validating...' : 'Validate & Preview'}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && importResult && (
            <div className="space-y-6">
              <div className={`rounded-lg p-4 flex items-start gap-3 ${
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 ${
                    importResult.success ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    Validation {importResult.success ? 'Successful' : 'Complete with Errors'}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className={importResult.success ? 'text-green-700' : 'text-yellow-700'}>
                      Total rows: {importResult.totalRows}
                    </p>
                    <p className="text-green-700">Valid rows: {importResult.successCount}</p>
                    {importResult.errorCount > 0 && (
                      <p className="text-red-700">Rows with errors: {importResult.errorCount}</p>
                    )}
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                    <h4 className="font-medium text-red-900">Errors Found</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Error</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importResult.errors.map((error, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{error.row}</td>
                            <td className="px-4 py-2 text-sm">{error.field || '-'}</td>
                            <td className="px-4 py-2 text-sm text-red-600">{error.message}</td>
                            <td className="px-4 py-2 text-sm font-mono text-xs">{error.value || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResult.successCount > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    {importResult.errorCount > 0
                      ? `${importResult.successCount} valid rows will be imported. Rows with errors will be skipped.`
                      : `All ${importResult.successCount} rows are valid and ready to import.`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('upload')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={processing || importResult.successCount === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Import {importResult.successCount} Rows
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Importing data...</p>
              <p className="text-sm text-gray-500">This may take a moment</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">Import Complete!</p>
              <p className="text-sm text-gray-500">Your data has been imported successfully</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
