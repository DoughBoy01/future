import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Database } from '../src/lib/database.types';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function exportCampsToCSV() {
  try {
    console.log('Fetching camps from database...');

    const { data, error } = await supabase
      .from('camps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No camps found in database');
      return;
    }

    // Type assertion to help TypeScript understand the data type
    const camps = data as Database['public']['Tables']['camps']['Row'][];

    console.log(`Found ${camps.length} camps`);

    type Camp = typeof camps[number];

    // Derive CSV headers dynamically from the first record
    // This ensures the export stays in sync with the database schema
    const headers = Object.keys(camps[0]) as Array<keyof Camp>;

    // Convert camps to CSV rows
    const rows = camps.map(camp => {
      return headers.map(header => {
        const value = camp[header];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Handle JSON fields (arrays and objects)
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        // Convert to string
        const stringValue = String(value);

        // Handle strings with commas or quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      }).join(',');
    });

    // Combine header and rows with BOM for Excel compatibility
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');

    // Write to file
    const outputPath = join(process.cwd(), 'camp_data_from_database.csv');
    writeFileSync(outputPath, csv, 'utf-8');

    console.log(`✅ Successfully exported ${camps.length} camps to: ${outputPath}`);

    // Print summary
    console.log('\n📊 Export Summary:');
    camps.forEach((camp, index) => {
      console.log(`${index + 1}. ${camp.name} (${camp.category}) - ${camp.status}`);
    });

  } catch (error) {
    console.error('Error exporting camps:', error);
    process.exit(1);
  }
}

exportCampsToCSV();
