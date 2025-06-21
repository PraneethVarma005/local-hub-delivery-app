import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'customer' | 'shop_owner' | 'delivery_partner'
  avatar_url?: string
  address?: string
  latitude?: number
  longitude?: number
  is_online?: boolean
  shop_name?: string
  shop_category?: string
  shop_address?: string
  vehicle_type?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  userRole: 'customer' | 'shop_owner' | 'delivery_partner' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    console.log('AuthProvider: Setting up auth state listener')
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth event:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session')
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('User signed in:', session.user.id)
          setUser(session.user)
          
          // Create basic profile immediately to prevent blocking
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'customer'
          }
          setProfile(basicProfile)
          setLoading(false)
          
          // Fetch detailed profile in background
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setTimeout(() => {
              if (mounted) {
                fetchProfile(session.user)
              }
            }, 0)
          }
        }
      }
    )

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session check:', session?.user?.id, error)
        
        if (error) {
          console.error('Session check error:', error)
          if (mounted) setLoading(false)
          return
        }
        
        if (session?.user && mounted) {
          setUser(session.user)
          
          // Create basic profile immediately
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'customer'
          }
          setProfile(basicProfile)
          setLoading(false)
          
          // Fetch detailed profile in background
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user)
            }
          }, 0)
        } else if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Session check failed:', error)
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    return () => {
      mounted = false
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (user: User) => {
    try {
      console.log('Fetching detailed profile for user:', user.id)
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating profile for user:', user.id)
        const metadata = user.user_metadata || {}
        
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: metadata.full_name || metadata.name || '',
          phone: metadata.phone || '',
          role: metadata.role || 'customer',
          shop_name: metadata.shop_name || null,
          shop_category: metadata.shop_category || null,
          shop_address: metadata.shop_address || null,
          vehicle_type: metadata.vehicle_type || null
        }

        const { data: insertedProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single()

        if (!insertError && insertedProfile) {
          console.log('Profile created successfully:', insertedProfile)
          setProfile(insertedProfile)
        }
      } else if (!error && profileData) {
        console.log('Profile fetched successfully:', profileData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      // Keep the basic profile we already set
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email)
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Attempting sign up for:', email)
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
        data: {
          full_name: userData.name,
          role: userData.role,
          phone: userData.phone,
          ...(userData.role === 'shop_owner' && {
            shop_name: userData.shop_name,
            shop_category: userData.shop_category,
            shop_address: userData.shop_address,
          }),
          ...(userData.role === 'delivery_partner' && {
            vehicle_type: userData.vehicle_type,
          }),
        }
      }
    })
    
    if (error) {
      console.error('Sign up error:', error)
      setLoading(false)
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('Signing out user')
    
    try {
      // Clear state immediately for better UX
      setUser(null)
      setProfile(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const value = {
    user,
    profile,
    userRole: profile?.role || null,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
