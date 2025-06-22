
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_D3uRdPvX_FmNHXpJJ1bZKwKRoGmGb2itQ");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  confirmationUrl: string;
  userType: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, userType, userName }: VerificationEmailRequest = await req.json();

    console.log('Sending verification email to:', email, 'Type:', userType);

    const emailResponse = await resend.emails.send({
      from: "LocalHub <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to LocalHub - Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2C3E50; margin: 0;">Welcome to LocalHub!</h1>
            <p style="color: #666; font-size: 16px;">Your local marketplace platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2C3E50; margin-top: 0;">Hello ${userName || 'there'}!</h2>
            <p style="color: #333; line-height: 1.6;">
              Thank you for joining LocalHub as a <strong>${userType.replace('_', ' ')}</strong>. 
              We're excited to have you as part of our community!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #16A085; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify Your Email Address
            </a>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>What's next?</strong><br>
              After verification, you'll be able to access all features of LocalHub and start ${
                userType === 'customer' ? 'ordering from local shops' :
                userType === 'shop_owner' ? 'managing your shop and receiving orders' :
                'accepting delivery requests and earning money'
              }.
            </p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #16A085; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 3px;">
            ${confirmationUrl}
          </p>

          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              Best regards,<br>
              The LocalHub Team
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
