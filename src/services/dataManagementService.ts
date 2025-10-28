import { supabase } from '../lib/supabase';

export interface TableConfig {
  name: string;
  displayName: string;
  category: 'core' | 'users' | 'operations' | 'content' | 'financial' | 'system';
  columns: ColumnConfig[];
  primaryKey: string;
  softDelete?: boolean;
  orderBy?: { column: string; ascending: boolean };
}

export interface ColumnConfig {
  name: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'enum' | 'json' | 'foreign_key';
  required?: boolean;
  editable?: boolean;
  enumValues?: string[];
  foreignKey?: {
    table: string;
    column: string;
    display: string;
  };
  validation?: (value: any) => string | null;
}

export interface FilterCondition {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
  value: any;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  column: string;
  ascending: boolean;
}

class DataManagementService {
  async getTableData(
    tableName: string,
    filters?: FilterCondition[],
    sort?: SortParams,
    pagination?: PaginationParams
  ) {
    try {
      let query = supabase.from(tableName).select('*', { count: 'exact' });

      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'like':
              query = query.like(filter.column, `%${filter.value}%`);
              break;
            case 'ilike':
              query = query.ilike(filter.column, `%${filter.value}%`);
              break;
            case 'in':
              query = query.in(filter.column, filter.value);
              break;
            case 'is':
              query = query.is(filter.column, filter.value);
              break;
          }
        });
      }

      if (sort) {
        query = query.order(sort.column, { ascending: sort.ascending });
      }

      if (pagination) {
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        count: count || 0,
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || data?.length || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
      };
    }
  }

  async getRecordById(tableName: string, id: string) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createRecord(tableName: string, record: any) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Record created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateRecord(tableName: string, id: string, updates: any) {
    try {
      console.log(`[DataManagement] Updating ${tableName} record ${id}:`, updates);

      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.created_at;

      const { data, error } = await supabase
        .from(tableName)
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[DataManagement] Update failed:`, error);

        let errorMessage = error.message;
        if (error.code === 'PGRST301') {
          errorMessage = 'Record not found or you do not have permission to update it.';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied. You do not have access to update this record.';
        } else if (error.code === '23505') {
          errorMessage = 'A record with this unique value already exists.';
        } else if (error.code === '23503') {
          errorMessage = 'Invalid reference. The related record does not exist.';
        } else if (error.message.includes('RLS')) {
          errorMessage = 'Access denied by security policy. Please contact an administrator.';
        }

        throw new Error(errorMessage);
      }

      console.log(`[DataManagement] Update successful:`, data);

      return {
        success: true,
        data,
        message: 'Record updated successfully',
      };
    } catch (error: any) {
      console.error(`[DataManagement] Update error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to update record',
      };
    }
  }

  async deleteRecord(tableName: string, id: string) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Record deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async bulkUpdate(tableName: string, ids: string[], updates: any) {
    try {
      console.log(`[DataManagement] Bulk updating ${ids.length} ${tableName} records:`, updates);

      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.created_at;

      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      if (Object.keys(cleanUpdates).length === 0) {
        return {
          success: false,
          error: 'No fields to update',
        };
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(cleanUpdates)
        .in('id', ids)
        .select();

      if (error) {
        console.error(`[DataManagement] Bulk update failed:`, error);

        let errorMessage = error.message;
        if (error.code === '42501') {
          errorMessage = 'Permission denied. You do not have access to update these records.';
        } else if (error.message.includes('RLS')) {
          errorMessage = 'Access denied by security policy. Please contact an administrator.';
        }

        throw new Error(errorMessage);
      }

      console.log(`[DataManagement] Bulk update successful: ${data?.length || 0} records updated`);

      return {
        success: true,
        data,
        count: data?.length || 0,
        message: `${data?.length || 0} records updated successfully`,
      };
    } catch (error: any) {
      console.error(`[DataManagement] Bulk update error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to update records',
      };
    }
  }

  async bulkDelete(tableName: string, ids: string[]) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;

      return {
        success: true,
        count: ids.length,
        message: `${ids.length} records deleted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async bulkInsert(tableName: string, records: any[]) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(records)
        .select();

      if (error) throw error;

      return {
        success: true,
        data,
        count: data?.length || 0,
        message: `${data?.length || 0} records created successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTableCount(tableName: string, filters?: FilterCondition[]) {
    try {
      let query = supabase.from(tableName).select('*', { count: 'exact', head: true });

      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'is':
              query = query.is(filter.column, filter.value);
              break;
          }
        });
      }

      const { count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        count: count || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  }

  async searchRecords(tableName: string, searchTerm: string, searchColumns: string[]) {
    try {
      let query = supabase.from(tableName).select('*');

      if (searchColumns.length > 0) {
        const orConditions = searchColumns.map(col => `${col}.ilike.%${searchTerm}%`).join(',');
        query = query.or(orConditions);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  async getForeignKeyOptions(tableName: string, displayColumn: string, idColumn: string = 'id') {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`${idColumn}, ${displayColumn}`)
        .order(displayColumn);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  async duplicateRecord(tableName: string, id: string, excludeFields: string[] = ['id', 'created_at', 'updated_at']) {
    try {
      const { data: original, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newRecord = { ...original };
      excludeFields.forEach(field => delete newRecord[field]);

      const { data, error } = await supabase
        .from(tableName)
        .insert(newRecord)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Record duplicated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getTableConfigs(): TableConfig[] {
    return [
      {
        name: 'schools',
        displayName: 'Schools',
        category: 'core',
        primaryKey: 'id',
        orderBy: { column: 'name', ascending: true },
        columns: [
          { name: 'name', displayName: 'School Name', type: 'text', required: true, editable: true },
          { name: 'slug', displayName: 'Slug', type: 'text', required: true, editable: true },
          { name: 'contact_email', displayName: 'Contact Email', type: 'text', required: true, editable: true },
          { name: 'contact_phone', displayName: 'Contact Phone', type: 'text', editable: true },
          { name: 'website', displayName: 'Website', type: 'text', editable: true },
          { name: 'timezone', displayName: 'Timezone', type: 'text', editable: true },
          { name: 'active', displayName: 'Active', type: 'boolean', editable: true },
          { name: 'created_at', displayName: 'Created At', type: 'datetime', editable: false },
        ],
      },
      {
        name: 'profiles',
        displayName: 'User Profiles',
        category: 'users',
        primaryKey: 'id',
        orderBy: { column: 'created_at', ascending: false },
        columns: [
          { name: 'first_name', displayName: 'First Name', type: 'text', required: true, editable: true },
          { name: 'last_name', displayName: 'Last Name', type: 'text', required: true, editable: true },
          { name: 'role', displayName: 'Role', type: 'enum', required: true, editable: true, enumValues: ['parent', 'school_admin', 'marketing', 'operations', 'risk', 'super_admin'] },
          { name: 'phone', displayName: 'Phone', type: 'text', editable: true },
          { name: 'school_id', displayName: 'School', type: 'foreign_key', editable: true, foreignKey: { table: 'schools', column: 'id', display: 'name' } },
          { name: 'last_seen_at', displayName: 'Last Seen', type: 'datetime', editable: false },
          { name: 'created_at', displayName: 'Created At', type: 'datetime', editable: false },
        ],
      },
      {
        name: 'camps',
        displayName: 'Camps',
        category: 'content',
        primaryKey: 'id',
        orderBy: { column: 'created_at', ascending: false },
        columns: [
          { name: 'name', displayName: 'Camp Name', type: 'text', required: true, editable: true },
          { name: 'slug', displayName: 'Slug', type: 'text', required: true, editable: true },
          { name: 'description', displayName: 'Description', type: 'text', editable: true },
          { name: 'category', displayName: 'Category', type: 'enum', editable: true, enumValues: ['sports', 'arts', 'stem', 'language', 'adventure', 'general', 'academic', 'creative'] },
          { name: 'status', displayName: 'Status', type: 'enum', editable: true, enumValues: ['draft', 'published', 'full', 'cancelled', 'completed'] },
          { name: 'school_id', displayName: 'School', type: 'foreign_key', required: true, editable: true, foreignKey: { table: 'schools', column: 'id', display: 'name' } },
          { name: 'start_date', displayName: 'Start Date', type: 'date', required: true, editable: true },
          { name: 'end_date', displayName: 'End Date', type: 'date', required: true, editable: true },
          { name: 'capacity', displayName: 'Capacity', type: 'number', required: true, editable: true },
          { name: 'price', displayName: 'Price', type: 'number', required: true, editable: true },
          { name: 'featured', displayName: 'Featured', type: 'boolean', editable: true },
          { name: 'created_at', displayName: 'Created At', type: 'datetime', editable: false },
        ],
      },
      {
        name: 'registrations',
        displayName: 'Registrations',
        category: 'operations',
        primaryKey: 'id',
        orderBy: { column: 'registration_date', ascending: false },
        columns: [
          { name: 'camp_id', displayName: 'Camp', type: 'foreign_key', required: true, editable: false, foreignKey: { table: 'camps', column: 'id', display: 'name' } },
          { name: 'status', displayName: 'Status', type: 'enum', editable: true, enumValues: ['pending', 'confirmed', 'waitlisted', 'cancelled', 'completed'] },
          { name: 'payment_status', displayName: 'Payment Status', type: 'enum', editable: true, enumValues: ['unpaid', 'partial', 'paid', 'refunded'] },
          { name: 'amount_paid', displayName: 'Amount Paid', type: 'number', editable: true },
          { name: 'amount_due', displayName: 'Amount Due', type: 'number', editable: true },
          { name: 'registration_date', displayName: 'Registration Date', type: 'datetime', editable: false },
          { name: 'forms_submitted', displayName: 'Forms Submitted', type: 'boolean', editable: true },
          { name: 'photo_permission', displayName: 'Photo Permission', type: 'boolean', editable: true },
        ],
      },
      {
        name: 'children',
        displayName: 'Children',
        category: 'users',
        primaryKey: 'id',
        orderBy: { column: 'created_at', ascending: false },
        columns: [
          { name: 'first_name', displayName: 'First Name', type: 'text', required: true, editable: true },
          { name: 'last_name', displayName: 'Last Name', type: 'text', required: true, editable: true },
          { name: 'date_of_birth', displayName: 'Date of Birth', type: 'date', required: true, editable: true },
          { name: 'gender', displayName: 'Gender', type: 'text', editable: true },
          { name: 'grade', displayName: 'Grade', type: 'text', editable: true },
          { name: 'school_id', displayName: 'School', type: 'foreign_key', editable: true, foreignKey: { table: 'schools', column: 'id', display: 'name' } },
          { name: 'allergies', displayName: 'Allergies', type: 'text', editable: true },
          { name: 'medical_conditions', displayName: 'Medical Conditions', type: 'text', editable: true },
          { name: 'created_at', displayName: 'Created At', type: 'datetime', editable: false },
        ],
      },
      {
        name: 'communications',
        displayName: 'Communications',
        category: 'content',
        primaryKey: 'id',
        orderBy: { column: 'created_at', ascending: false },
        columns: [
          { name: 'type', displayName: 'Type', type: 'enum', required: true, editable: true, enumValues: ['email', 'sms', 'notification', 'announcement'] },
          { name: 'subject', displayName: 'Subject', type: 'text', editable: true },
          { name: 'body', displayName: 'Body', type: 'text', required: true, editable: true },
          { name: 'status', displayName: 'Status', type: 'enum', editable: true, enumValues: ['draft', 'scheduled', 'sent', 'failed'] },
          { name: 'recipient_type', displayName: 'Recipient Type', type: 'enum', required: true, editable: true, enumValues: ['all_parents', 'camp_specific', 'individual'] },
          { name: 'sent_at', displayName: 'Sent At', type: 'datetime', editable: false },
          { name: 'scheduled_for', displayName: 'Scheduled For', type: 'datetime', editable: true },
          { name: 'created_at', displayName: 'Created At', type: 'datetime', editable: false },
        ],
      },
      {
        name: 'discount_codes',
        displayName: 'Discount Codes',
        category: 'financial',
        primaryKey: 'id',
        orderBy: { column: 'created_at', ascending: false },
        columns: [
          { name: 'code', displayName: 'Code', type: 'text', required: true, editable: true },
          { name: 'description', displayName: 'Description', type: 'text', editable: true },
          { name: 'discount_type', displayName: 'Discount Type', type: 'enum', required: true, editable: true, enumValues: ['percentage', 'fixed_amount'] },
          { name: 'discount_value', displayName: 'Discount Value', type: 'number', required: true, editable: true },
          { name: 'valid_from', displayName: 'Valid From', type: 'date', required: true, editable: true },
          { name: 'valid_until', displayName: 'Valid Until', type: 'date', required: true, editable: true },
          { name: 'active', displayName: 'Active', type: 'boolean', editable: true },
          { name: 'uses_count', displayName: 'Uses Count', type: 'number', editable: false },
          { name: 'max_uses', displayName: 'Max Uses', type: 'number', editable: true },
        ],
      },
      {
        name: 'incidents',
        displayName: 'Incidents',
        category: 'operations',
        primaryKey: 'id',
        orderBy: { column: 'incident_date', ascending: false },
        columns: [
          { name: 'incident_type', displayName: 'Incident Type', type: 'enum', required: true, editable: true, enumValues: ['injury', 'behavioral', 'medical', 'other'] },
          { name: 'severity', displayName: 'Severity', type: 'enum', required: true, editable: true, enumValues: ['low', 'medium', 'high', 'critical'] },
          { name: 'description', displayName: 'Description', type: 'text', required: true, editable: true },
          { name: 'action_taken', displayName: 'Action Taken', type: 'text', required: true, editable: true },
          { name: 'incident_date', displayName: 'Incident Date', type: 'datetime', required: true, editable: true },
          { name: 'parent_notified', displayName: 'Parent Notified', type: 'boolean', editable: true },
          { name: 'follow_up_required', displayName: 'Follow-up Required', type: 'boolean', editable: true },
          { name: 'follow_up_completed', displayName: 'Follow-up Completed', type: 'boolean', editable: true },
        ],
      },
      {
        name: 'feedback',
        displayName: 'Feedback',
        category: 'operations',
        primaryKey: 'id',
        orderBy: { column: 'submitted_at', ascending: false },
        columns: [
          { name: 'overall_rating', displayName: 'Overall Rating', type: 'number', required: true, editable: false },
          { name: 'staff_rating', displayName: 'Staff Rating', type: 'number', editable: false },
          { name: 'activities_rating', displayName: 'Activities Rating', type: 'number', editable: false },
          { name: 'facilities_rating', displayName: 'Facilities Rating', type: 'number', editable: false },
          { name: 'value_rating', displayName: 'Value Rating', type: 'number', editable: false },
          { name: 'comments', displayName: 'Comments', type: 'text', editable: false },
          { name: 'would_recommend', displayName: 'Would Recommend', type: 'boolean', editable: false },
          { name: 'testimonial_permission', displayName: 'Testimonial Permission', type: 'boolean', editable: true },
          { name: 'submitted_at', displayName: 'Submitted At', type: 'datetime', editable: false },
        ],
      },
    ];
  }

  getTableConfig(tableName: string): TableConfig | undefined {
    return this.getTableConfigs().find(config => config.name === tableName);
  }
}

export const dataManagementService = new DataManagementService();
