
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: any, captchaToken?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: any }>
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
      }
    )

    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: any, captchaToken?: string) => {
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

      if (captchaToken) {
        signUpOptions.options.captchaToken = captchaToken
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

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    try {
      console.log('SignIn attempt for:', email)
      
      const signInOptions: any = {
        email,
        password
      }

      if (captchaToken) {
        signInOptions.options = {
          captchaToken: captchaToken
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword(signInOptions)

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
    if (!user?.user_metadata) return 'customer'
    return user.user_metadata.role || 'customer'
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userRole: getUserRole()
  }

  console.log('Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    role: getUserRole()
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
