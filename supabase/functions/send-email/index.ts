/**
 * Send Email Edge Function
 *
 * Unified email sending service for all transactional emails.
 * Integrates with Resend API and provides email tracking via email_logs table.
 *
 * Features:
 * - Template-based email rendering
 * - Automatic email logging with status tracking
 * - Retry queue for failed sends
 * - Error handling and reporting
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  renderTemplate,
  validateTemplateData,
  getTemplateMetadata,
  TemplateName,
  TemplateData,
} from './template-registry.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Request body interface
interface SendEmailRequest {
  template: TemplateName;
  to: {
    email: string;
    name?: string;
  };
  data: TemplateData;
  context?: {
    type: string;
    id: string;
    profile_id?: string;
  };
}

// Response interface
interface SendEmailResponse {
  success: boolean;
  email_id?: string;
  email_log_id?: string;
  error?: string;
  queued_for_retry?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const request: SendEmailRequest = await req.json();

    console.log('📧 Send email request:', {
      template: request.template,
      recipient: request.to.email,
      context: request.context,
    });

    // Validate required fields
    if (!request.template || !request.to?.email || !request.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: template, to.email, or data',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate template data
    const validation = validateTemplateData(request.template, request.data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid template data: ${validation.error}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail =
      Deno.env.get('FROM_EMAIL') || 'FutureEdge <noreply@futureedge.com>';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey =
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service not configured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Render template
    console.log('🎨 Rendering template:', request.template);
    let rendered;
    try {
      rendered = renderTemplate(request.template, request.data);
    } catch (renderError: any) {
      console.error('❌ Template render error:', renderError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Template render failed: ${renderError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get template metadata for priority
    const templateMeta = getTemplateMetadata(request.template);

    // Create email log entry
    console.log('📝 Creating email log entry');
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        template_name: request.template,
        recipient_email: request.to.email,
        recipient_name: request.to.name,
        recipient_profile_id: request.context?.profile_id,
        subject: rendered.subject,
        preview_text: rendered.previewText,
        status: 'pending',
        context_type: request.context?.type,
        context_id: request.context?.id,
        metadata: {
          template_category: templateMeta.category,
        },
      })
      .select('id')
      .single();

    if (logError) {
      console.error('❌ Failed to create email log:', logError.message);
      // Continue anyway - don't block email sending
    }

    const emailLogId = emailLog?.id;

    // Send email via Resend API
    console.log('📤 Sending email to Resend API');
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [request.to.email],
        subject: rendered.subject,
        html: rendered.html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendData);

      // Update email log with error
      if (emailLogId) {
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_code: resendData.statusCode || resendResponse.status,
            error_message: resendData.message || 'Failed to send via Resend',
            retry_count: 1,
          })
          .eq('id', emailLogId);
      }

      // Add to retry queue
      console.log('📥 Adding to retry queue');
      await supabase.rpc('queue_email_for_retry', {
        p_email_log_id: emailLogId,
        p_template_name: request.template,
        p_recipient_email: request.to.email,
        p_template_data: request.data,
        p_error_message: resendData.message || 'Resend API error',
        p_priority: templateMeta.priority,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          queued_for_retry: true,
          email_log_id: emailLogId,
        } as SendEmailResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Success - update email log
    console.log('✅ Email sent successfully:', resendData.id);
    if (emailLogId) {
      await supabase
        .from('email_logs')
        .update({
          resend_email_id: resendData.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', emailLogId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: resendData.id,
        email_log_id: emailLogId,
      } as SendEmailResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      } as SendEmailResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
