
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: (role: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  userRole: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.email || 'No user')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user role from users table
        if (session?.user) {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (error) {
              console.error('Error fetching user role:', error)
              setUserRole('customer') // fallback
            } else {
              setUserRole(userData.role)
            }
          } catch (error) {
            console.error('Exception fetching user role:', error)
            setUserRole('customer') // fallback
          }
        } else {
          setUserRole(null)
        }
        
        setLoading(false)
      }
    )

    // Then get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        console.log('Initial session:', session?.user?.email || 'No session')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user role from users table
        if (session?.user) {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (error) {
              console.error('Error fetching user role:', error)
              setUserRole('customer') // fallback
            } else {
              setUserRole(userData.role)
            }
          } catch (error) {
            console.error('Exception fetching user role:', error)
            setUserRole('customer') // fallback
          }
        } else {
          setUserRole(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const checkExistingUser = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', email.toLowerCase())
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking existing user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Exception checking existing user:', error)
      return null
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('SignUp attempt for:', email, 'with role:', userData.role)
      
      // Check if user already exists with any role
      const existingUser = await checkExistingUser(email)
      if (existingUser) {
        const roleDisplayName = existingUser.role.replace('_', ' ')
        return { 
          error: { 
            message: `This email is already registered as a ${roleDisplayName}. Please log in or use a different email.` 
          } 
        }
      }
      
      const redirectUrl = `${window.location.origin}/auth/login`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...userData,
            email: email.toLowerCase() // Ensure email is lowercase
          }
        }
      })

      if (error) {
        console.error('SignUp error:', error)
        return { error }
      }

      console.log('SignUp successful:', data)
      return { error: null }
    } catch (error) {
      console.error('SignUp exception:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn attempt for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('SignIn error:', error)
        return { error }
      }

      console.log('SignIn successful:', data.user?.email)
      return { error: null }
    } catch (error) {
      console.error('SignIn exception:', error)
      return { error }
    }
  }

  const signInWithGoogle = async (role: string) => {
    try {
      console.log('Google SignIn attempt with role:', role)
      
      const redirectUrl = `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            role: role
          }
        }
      })

      if (error) {
        console.error('Google SignIn error:', error)
        return { error }
      }

      console.log('Google SignIn initiated successfully')
      return { error: null }
    } catch (error) {
      console.error('Google SignIn exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('SignOut error:', error)
      }
      // Clear local state immediately
      setUser(null)
      setSession(null)
      setUserRole(null)
    } catch (error) {
      console.error('SignOut exception:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    userRole
  }

  console.log('Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    role: userRole,
    provider: user?.app_metadata?.provider
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
