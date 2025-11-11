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

    const { data: camps, error } = await supabase
      .from('camps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!camps || camps.length === 0) {
      console.log('No camps found in database');
      return;
    }

    console.log(`Found ${camps.length} camps`);

    // CSV Header - all 47 fields
    const headers = [
      'id',
      'organisation_id',
      'name',
      'slug',
      'description',
      'category',
      'age_min',
      'age_max',
      'grade_min',
      'grade_max',
      'start_date',
      'end_date',
      'capacity',
      'price',
      'currency',
      'early_bird_price',
      'early_bird_deadline',
      'payment_link',
      'commission_rate',
      'enrolled_count',
      'enquiries_enabled',
      'location',
      'what_to_bring',
      'requirements',
      'featured_image_url',
      'gallery_urls',
      'video_url',
      'video_urls',
      'video_metadata',
      'image_metadata',
      'highlights',
      'amenities',
      'faqs',
      'staff_credentials',
      'daily_schedule',
      'schedule',
      'included_in_price',
      'not_included_in_price',
      'cancellation_policy',
      'refund_policy',
      'safety_protocols',
      'insurance_info',
      'status',
      'featured',
      'published_at',
      'created_by',
      'created_at',
      'updated_at'
    ];

    // Convert camps to CSV rows
    const rows = camps.map(camp => {
      return headers.map(header => {
        const value = camp[header as keyof typeof camp];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Handle JSON fields (arrays and objects)
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      }).join(',');
    });

    // Combine header and rows
    const csv = [headers.join(','), ...rows].join('\n');

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
