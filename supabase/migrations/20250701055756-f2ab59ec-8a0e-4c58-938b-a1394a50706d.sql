
-- Create chat_logs table for storing conversations
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own chat logs
CREATE POLICY "Users can view their own chat logs" 
  ON public.chat_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own chat logs
CREATE POLICY "Users can create their own chat logs" 
  ON public.chat_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
