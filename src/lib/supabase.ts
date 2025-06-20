
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iywbhfqnisfgwfythnna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d2JoZnFuaXNmZ3dmeXRobm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTg1MzksImV4cCI6MjA2NTk3NDUzOX0.dzzV0luOQN72Jg0CchlZqjsl8ieZqq-dgMyKBlch6GQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
