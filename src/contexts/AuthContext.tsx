
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

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        console.log('Initial session:', session?.user?.email || 'No session')
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.email || 'No user')
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle Google OAuth user - check URL params for role
        if (event === 'SIGNED_IN' && session?.user) {
          const urlParams = new URLSearchParams(window.location.search)
          const roleParam = urlParams.get('role')
          
          if (roleParam && session.user.app_metadata.provider === 'google') {
            console.log('Google OAuth user detected with role:', roleParam)
            
            // Update user metadata with role
            try {
              const { error } = await supabase.auth.updateUser({
                data: { role: roleParam }
              })
              
              if (error) {
                console.error('Error updating user role:', error)
              } else {
                console.log('User role updated successfully to:', roleParam)
              }
            } catch (error) {
              console.error('Exception updating user role:', error)
            }
          }
        }
      }
    )

    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('SignUp attempt for:', email)
      
      const redirectUrl = `${window.location.origin}/auth/login`
      
      const signUpOptions: any = {
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      }

      const { data, error } = await supabase.auth.signUp(signUpOptions)

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
      
      const redirectUrl = `${window.location.origin}/auth/callback?role=${role}`
      
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
    } catch (error) {
      console.error('SignOut exception:', error)
    }
  }

  const getUserRole = () => {
    if (!user) return 'customer'
    
    // Check user_metadata first (for Google OAuth users)
    if (user.user_metadata?.role) {
      return user.user_metadata.role
    }
    
    // Check app_metadata as fallback
    if (user.app_metadata?.role) {
      return user.app_metadata.role
    }
    
    return 'customer'
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    userRole: getUserRole()
  }

  console.log('Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    role: getUserRole(),
    provider: user?.app_metadata?.provider
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
