import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  email: string;
  token: string;
  inviterName: string;
  organisationName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, token, inviterName, organisationName }: InviteRequest = await req.json();

    // Validate required fields
    if (!email || !token || !inviterName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, token, inviterName' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get app URL from environment (default to localhost for development)
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const inviteUrl = `${appUrl}/signup?invite_token=${token}`;

    // Build email content
    const subject = 'You\'ve been invited to join FutureEdge as a Camp Organizer';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #222222;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #FF385C 0%, #fe4d39 100%);
              color: white;
              padding: 30px;
              border-radius: 12px 12px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #DDDDDD;
              border-top: none;
            }
            .highlight {
              background: #F7F7F7;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background: #FF385C;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #F7F7F7;
              padding: 20px;
              border-radius: 0 0 12px 12px;
              text-align: center;
              font-size: 12px;
              color: #717171;
              border: 1px solid #DDDDDD;
              border-top: none;
            }
            .link {
              color: #FF385C;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎪 Welcome to FutureEdge!</h1>
          </div>

          <div class="content">
            <p>Hi there,</p>

            <p>
              <strong>${inviterName}</strong> has invited you to join FutureEdge as a camp organizer
              ${organisationName ? ` for <strong>${organisationName}</strong>` : ''}.
            </p>

            <div class="highlight">
              <p style="margin: 0;"><strong>What's next?</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Click the button below to accept your invitation</li>
                <li>Complete your registration with a password</li>
                <li>Set up your camp organizer profile</li>
                <li>Start creating amazing camp experiences!</li>
              </ul>
            </div>

            <center>
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
            </center>

            <p style="font-size: 14px; color: #717171;">
              Or copy and paste this link into your browser:<br>
              <a href="${inviteUrl}" class="link">${inviteUrl}</a>
            </p>

            <p style="font-size: 12px; color: #717171; margin-top: 30px;">
              <strong>⏰ Important:</strong> This invitation expires in 7 days.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">
              This email was sent by FutureEdge. If you didn't expect this invitation,
              you can safely ignore this email.
            </p>
            <p style="margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} FutureEdge. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') || 'FutureEdge <noreply@futureedge.com>',
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: resendData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Email sent successfully:', resendData);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: 'Invitation email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error sending invite email:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
