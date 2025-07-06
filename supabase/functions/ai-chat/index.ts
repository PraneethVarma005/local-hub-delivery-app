
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openRouterApiKey = Deno.env.get('OR_API_KEY');

serve(async (req) => {
  console.log('AI Chat function called, method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Step 1: Read raw body safely
    const bodyText = await req.text();

    // Step 2: Try parsing the body
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 3: Ensure message exists
    if (!body?.message) {
      console.error('Missing message field');
      return new Response(
        JSON.stringify({ error: "Missing 'message' in request body" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message } = body;

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('No valid message provided');
    }

    if (!openRouterApiKey) {
      console.error('OpenRouter API key not configured');
      return new Response(JSON.stringify({ 
        response: 'Sorry, I\'m unavailable at the moment. The AI service is not configured. Please contact support.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message from user:', user.id, 'Message length:', message.length);

    // Step 4: Use OpenRouter API
    let aiResponse;
    try {
      console.log('Making OpenRouter API call');
      
      const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'LocalHub AI Assistant'
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { 
              role: "system", 
              content: "You are LocalHub's helpful assistant. You help users with questions about orders, deliveries, shops, and general app usage. Keep responses concise, friendly, and helpful. If users ask about technical issues, provide clear step-by-step guidance." 
            },
            { role: "user", content: message.trim() }
          ],
          max_tokens: 500,
          temperature: 0.7,
        })
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('OpenRouter API error:', chatResponse.status, errorText);
        throw new Error(`OpenRouter API error: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      console.log('OpenRouter response received, choices:', chatData.choices?.length || 0);
      
      aiResponse = chatData.choices?.[0]?.message?.content;

      if (!aiResponse || typeof aiResponse !== 'string') {
        console.error('Invalid AI response format:', chatData);
        throw new Error('Invalid response from OpenRouter');
      }

    } catch (apiError) {
      console.error('OpenRouter API call failed:', apiError);
      
      // Return a friendly fallback message
      aiResponse = 'Sorry, I\'m unavailable at the moment. Please try again in a few minutes, or contact support if the issue persists.';
    }

    console.log('AI Response generated, length:', aiResponse.length);

    // Save to chat_logs table
    try {
      const { error: logError } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          user_message: message.trim(),
          ai_response: aiResponse,
        });

      if (logError) {
        console.error('Error saving chat log:', logError);
      } else {
        console.log('Chat log saved successfully');
      }
    } catch (logError) {
      console.error('Exception saving chat log:', logError);
    }

    // Step 5: Return reply to frontend (using 'response' key to match frontend expectations)
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'Sorry, I\'m experiencing some technical difficulties. Please try again in a moment.';
    
    if (error.message === 'Unauthorized') {
      errorMessage = 'Please log in to use the AI assistant.';
    } else if (error.message.includes('No valid message')) {
      errorMessage = 'Please provide a valid message to get assistance.';
    }
    
    return new Response(JSON.stringify({ 
      response: errorMessage
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
