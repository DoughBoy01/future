/**
 * Database Test Script
 *
 * This script tests read and write operations to the Supabase database.
 * It demonstrates interactions with the camps table.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseOperations() {
  console.log('🔍 Starting database connection test...\n');

  try {
    // Test 1: Read all camps (SELECT operation)
    console.log('📖 TEST 1: Reading camps from database...');
    const { data: camps, error: readError } = await supabase
      .from('camps')
      .select('*')
      .limit(5);

    if (readError) {
      console.error('❌ Read Error:', readError.message);
    } else {
      console.log(`✅ Successfully read ${camps?.length || 0} camps`);
      if (camps && camps.length > 0) {
        console.log('Sample camp:', {
          id: camps[0].id,
          name: camps[0].name,
          category: camps[0].category,
          status: camps[0].status,
        });
      }
    }

    console.log('\n---\n');

    // Test 2: Read schools
    console.log('📖 TEST 2: Reading schools from database...');
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, slug, active');

    if (schoolError) {
      console.error('❌ Read Error:', schoolError.message);
    } else {
      console.log(`✅ Successfully read ${schools?.length || 0} schools`);
      if (schools && schools.length > 0) {
        console.log('Schools:', schools);
      }
    }

    console.log('\n---\n');

    // Test 3: Read profiles with role information
    console.log('📖 TEST 3: Reading profiles from database...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(5);

    if (profileError) {
      console.error('❌ Read Error:', profileError.message);
    } else {
      console.log(`✅ Successfully read ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log('Sample profiles:', profiles);
      }
    }

    console.log('\n---\n');

    // Test 4: Count registrations
    console.log('📊 TEST 4: Counting registrations...');
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count Error:', countError.message);
    } else {
      console.log(`✅ Total registrations in database: ${count}`);
    }

    console.log('\n---\n');

    // Test 5: Read feedback with ratings
    console.log('📖 TEST 5: Reading feedback from database...');
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('overall_rating, would_recommend, comments')
      .limit(3);

    if (feedbackError) {
      console.error('❌ Read Error:', feedbackError.message);
    } else {
      console.log(`✅ Successfully read ${feedback?.length || 0} feedback entries`);
      if (feedback && feedback.length > 0) {
        console.log('Sample feedback:', feedback);
      }
    }

    console.log('\n---\n');

    // Test 6: Test authenticated user context
    console.log('🔐 TEST 6: Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('⚠️  Not authenticated - some operations may be restricted');
      console.log('   This is expected if running without login credentials');
    } else if (user) {
      console.log(`✅ Authenticated as: ${user.email}`);
      console.log(`   User ID: ${user.id}`);
    } else {
      console.log('ℹ️  No active user session');
    }

    console.log('\n---\n');

    // Test 7: Attempt a write operation (INSERT)
    // Note: This will only succeed if user has proper permissions
    console.log('✍️  TEST 7: Testing write operation...');
    console.log('   Attempting to insert a test discount code...');

    const testCode = {
      code: `TEST_${Date.now()}`,
      description: 'Database test discount code',
      discount_type: 'percentage',
      discount_value: 10,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: false, // Set to inactive so it doesn't affect real operations
    };

    const { data: insertedCode, error: insertError } = await supabase
      .from('discount_codes')
      .insert(testCode)
      .select();

    if (insertError) {
      console.log('⚠️  Write operation failed (expected without proper auth/permissions):');
      console.log(`   ${insertError.message}`);
      console.log('   This is normal - RLS policies restrict writes');
    } else {
      console.log('✅ Successfully inserted test discount code:');
      console.log('   Code:', insertedCode?.[0]?.code);
      console.log('   ID:', insertedCode?.[0]?.id);

      // Clean up: delete the test code
      if (insertedCode?.[0]?.id) {
        const { error: deleteError } = await supabase
          .from('discount_codes')
          .delete()
          .eq('id', insertedCode[0].id);

        if (!deleteError) {
          console.log('   ✅ Test code cleaned up successfully');
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database connection test completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected error during database test:', error);
  }
}

// Run the test
testDatabaseOperations();
