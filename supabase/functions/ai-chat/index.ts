
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
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { message } = requestBody;

    if (!message) {
      throw new Error('No message provided');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        response: 'AI service is currently unavailable. The OpenAI API key is not configured. Please contact support.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message from user:', user.id, 'Message length:', message.length);

    // Call OpenAI API with enhanced retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        console.log(`OpenAI API attempt ${retryCount + 1}`);
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are a helpful assistant for LocalHub, a local delivery service app. You help users with questions about orders, deliveries, shops, and general app usage. Keep responses concise, friendly, and helpful. If users ask about technical issues, provide clear step-by-step guidance.' 
              },
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          console.log('OpenAI API call successful');
          break;
        } else {
          const errorText = await response.text();
          console.error(`OpenAI API error (attempt ${retryCount + 1}):`, response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (fetchError) {
        console.error(`OpenAI API fetch attempt ${retryCount + 1} failed:`, fetchError);
        retryCount++;
        
        if (retryCount > maxRetries) {
          console.error('All OpenAI API attempts failed');
          return new Response(JSON.stringify({ 
            response: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the issue persists.' 
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
      }
    }

    const data = await response.json();
    console.log('OpenAI response received, choices:', data.choices?.length || 0);
    
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No AI response content received');
      return new Response(JSON.stringify({ 
        response: 'I received your message but couldn\'t generate a proper response. Please try rephrasing your question or try again later.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Response generated successfully, length:', aiResponse.length);

    // Save to chat_logs table
    try {
      const { error: logError } = await supabase
        .from('chat_logs')
        .insert({
          user_id: user.id,
          user_message: message,
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

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    // Return a user-friendly error message
    const errorMessage = error.message === 'Unauthorized' 
      ? 'Please log in to use the AI assistant.'
      : 'I\'m experiencing some technical difficulties. Please try again in a moment.';
    
    return new Response(JSON.stringify({ 
      response: errorMessage
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
