/**
 * Process Email Queue Edge Function
 *
 * Retry processor for failed email sends.
 * Runs periodically (e.g., every 5 minutes via cron) to process queued emails.
 *
 * Features:
 * - Fetches emails ready for retry
 * - Exponential backoff (1min → 5min → 30min → 2hr)
 * - Abandons emails after max retries
 * - Tracks retry history
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  abandoned: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting email queue processor');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey =
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch emails ready for retry
    const { data: queueItems, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('next_retry_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching queue items:', fetchError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('✅ No emails to process');
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          succeeded: 0,
          failed: 0,
          abandoned: 0,
          errors: [],
        } as ProcessResult),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📧 Processing ${queueItems.length} queued emails`);

    const result: ProcessResult = {
      processed: queueItems.length,
      succeeded: 0,
      failed: 0,
      abandoned: 0,
      errors: [],
    };

    // Process each queued email
    for (const item of queueItems) {
      console.log(`\n📤 Processing queue item ${item.id}`);

      // Mark as processing
      await supabase
        .from('email_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      try {
        // Call send-email function
        const sendResponse = await supabase.functions.invoke('send-email', {
          body: {
            template: item.template_name,
            to: { email: item.recipient_email },
            data: item.template_data,
          },
        });

        if (sendResponse.error) {
          throw sendResponse.error;
        }

        const sendData = sendResponse.data;

        if (sendData?.success) {
          // Success - mark as completed
          console.log(`✅ Email sent successfully (queue item: ${item.id})`);

          await supabase
            .from('email_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          result.succeeded++;
        } else {
          // Failed - increment retry or abandon
          const errorMessage =
            sendData?.error || 'Unknown error from send-email function';
          console.log(`❌ Send failed (queue item: ${item.id}): ${errorMessage}`);

          await supabase.rpc('increment_email_retry', {
            p_queue_id: item.id,
            p_error_message: errorMessage,
          });

          if (item.retry_count + 1 >= item.max_retries) {
            result.abandoned++;
            result.errors.push(
              `Abandoned ${item.recipient_email} after ${item.max_retries} retries: ${errorMessage}`
            );
          } else {
            result.failed++;
            result.errors.push(
              `Retry ${item.retry_count + 1}/${item.max_retries} for ${item.recipient_email}: ${errorMessage}`
            );
          }
        }
      } catch (error: any) {
        console.error(`❌ Error processing queue item ${item.id}:`, error);

        // Increment retry or abandon
        await supabase.rpc('increment_email_retry', {
          p_queue_id: item.id,
          p_error_message: error.message || 'Processing error',
        });

        if (item.retry_count + 1 >= item.max_retries) {
          result.abandoned++;
          result.errors.push(
            `Abandoned ${item.recipient_email} after ${item.max_retries} retries: ${error.message}`
          );
        } else {
          result.failed++;
          result.errors.push(
            `Retry ${item.retry_count + 1}/${item.max_retries} for ${item.recipient_email}: ${error.message}`
          );
        }
      }
    }

    console.log('\n📊 Queue processing complete:');
    console.log(`  Processed: ${result.processed}`);
    console.log(`  Succeeded: ${result.succeeded}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Abandoned: ${result.abandoned}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
