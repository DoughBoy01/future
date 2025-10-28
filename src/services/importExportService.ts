import { TableConfig, ColumnConfig } from './dataManagementService';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  data?: any[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  columns?: string[];
  includeHeaders?: boolean;
}

class ImportExportService {
  parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => this.parseCSVLine(line));

    return { headers, rows };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  validateImportData(
    headers: string[],
    rows: string[][],
    tableConfig: TableConfig
  ): ImportResult {
    const errors: ImportError[] = [];
    const validatedData: any[] = [];
    let successCount = 0;

    const columnMap = new Map<string, ColumnConfig>();
    tableConfig.columns.forEach(col => columnMap.set(col.name, col));

    const headerIndexMap = new Map<string, number>();
    headers.forEach((header, index) => {
      const normalizedHeader = header.trim().toLowerCase();
      const matchingColumn = tableConfig.columns.find(
        col => col.name.toLowerCase() === normalizedHeader ||
              col.displayName.toLowerCase() === normalizedHeader
      );
      if (matchingColumn) {
        headerIndexMap.set(matchingColumn.name, index);
      }
    });

    const requiredColumns = tableConfig.columns.filter(col => col.required);
    const missingRequired = requiredColumns.filter(
      col => !headerIndexMap.has(col.name)
    );

    if (missingRequired.length > 0) {
      errors.push({
        row: 0,
        message: `Missing required columns: ${missingRequired.map(c => c.displayName).join(', ')}`,
      });
    }

    rows.forEach((row, rowIndex) => {
      const rowData: any = {};
      let rowHasErrors = false;

      tableConfig.columns.forEach(column => {
        const headerIndex = headerIndexMap.get(column.name);
        if (headerIndex === undefined) {
          if (column.required) {
            errors.push({
              row: rowIndex + 2,
              field: column.displayName,
              message: 'Required field missing',
            });
            rowHasErrors = true;
          }
          return;
        }

        const value = row[headerIndex]?.trim();

        if (column.required && (!value || value === '')) {
          errors.push({
            row: rowIndex + 2,
            field: column.displayName,
            message: 'Required field is empty',
          });
          rowHasErrors = true;
          return;
        }

        if (!value || value === '') {
          rowData[column.name] = null;
          return;
        }

        const validationResult = this.validateAndConvertValue(value, column);
        if (!validationResult.valid) {
          errors.push({
            row: rowIndex + 2,
            field: column.displayName,
            message: validationResult.error || 'Invalid value',
            value,
          });
          rowHasErrors = true;
        } else {
          rowData[column.name] = validationResult.value;
        }
      });

      if (!rowHasErrors) {
        validatedData.push(rowData);
        successCount++;
      }
    });

    return {
      success: errors.length === 0,
      totalRows: rows.length,
      successCount,
      errorCount: rows.length - successCount,
      errors,
      data: validatedData,
    };
  }

  private validateAndConvertValue(
    value: string,
    column: ColumnConfig
  ): { valid: boolean; value?: any; error?: string } {
    if (column.validation) {
      const error = column.validation(value);
      if (error) {
        return { valid: false, error };
      }
    }

    switch (column.type) {
      case 'number': {
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { valid: false, error: 'Must be a valid number' };
        }
        return { valid: true, value: num };
      }

      case 'boolean': {
        const lowerValue = value.toLowerCase();
        if (['true', 'yes', '1', 'y'].includes(lowerValue)) {
          return { valid: true, value: true };
        }
        if (['false', 'no', '0', 'n'].includes(lowerValue)) {
          return { valid: true, value: false };
        }
        return { valid: false, error: 'Must be true/false, yes/no, or 1/0' };
      }

      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, error: 'Must be a valid date' };
        }
        return { valid: true, value: date.toISOString().split('T')[0] };
      }

      case 'datetime': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, error: 'Must be a valid date/time' };
        }
        return { valid: true, value: date.toISOString() };
      }

      case 'enum': {
        if (column.enumValues && !column.enumValues.includes(value)) {
          return {
            valid: false,
            error: `Must be one of: ${column.enumValues.join(', ')}`,
          };
        }
        return { valid: true, value };
      }

      case 'json': {
        try {
          const parsed = JSON.parse(value);
          return { valid: true, value: parsed };
        } catch {
          return { valid: false, error: 'Must be valid JSON' };
        }
      }

      default:
        return { valid: true, value };
    }
  }

  generateCSVTemplate(tableConfig: TableConfig): string {
    const headers = tableConfig.columns
      .filter(col => col.editable !== false)
      .map(col => col.displayName);

    const exampleRow = tableConfig.columns
      .filter(col => col.editable !== false)
      .map(col => this.getExampleValue(col));

    const csvLines = [
      headers.join(','),
      exampleRow.join(','),
    ];

    return csvLines.join('\n');
  }

  private getExampleValue(column: ColumnConfig): string {
    switch (column.type) {
      case 'text':
        return `"Example ${column.displayName}"`;
      case 'number':
        return '100';
      case 'boolean':
        return 'true';
      case 'date':
        return '2024-01-01';
      case 'datetime':
        return '2024-01-01T12:00:00Z';
      case 'enum':
        return column.enumValues?.[0] || 'value';
      case 'json':
        return '{"key":"value"}';
      default:
        return 'example';
    }
  }

  exportToCSV(data: any[], columns: ColumnConfig[], options: ExportOptions = {}): string {
    const selectedColumns = options.columns
      ? columns.filter(col => options.columns?.includes(col.name))
      : columns;

    const headers = selectedColumns.map(col => col.displayName);
    const csvLines: string[] = [];

    if (options.includeHeaders !== false) {
      csvLines.push(headers.map(h => this.escapeCSVValue(h)).join(','));
    }

    data.forEach(row => {
      const values = selectedColumns.map(col => {
        const value = row[col.name];
        return this.escapeCSVValue(this.formatValueForExport(value, col.type));
      });
      csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
  }

  private escapeCSVValue(value: string): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private formatValueForExport(value: any, type: string): string {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      case 'datetime':
        return new Date(value).toISOString();
      case 'json':
        return JSON.stringify(value);
      case 'number':
        return String(value);
      default:
        return String(value);
    }
  }

  exportToJSON(data: any[], columns: ColumnConfig[], options: ExportOptions = {}): string {
    const selectedColumns = options.columns
      ? columns.filter(col => options.columns?.includes(col.name))
      : columns;

    const exportData = data.map(row => {
      const exportRow: any = {};
      selectedColumns.forEach(col => {
        exportRow[col.name] = row[col.name];
      });
      return exportRow;
    });

    return JSON.stringify(exportData, null, 2);
  }

  downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}

export const importExportService = new ImportExportService();
