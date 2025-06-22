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
          console.log('User signed in:', session.user.id, 'Role from metadata:', session.user.user_metadata?.role)
          setUser(session.user)
          
          // Set basic profile from metadata immediately
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

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session check:', session?.user?.id, 'Role:', session?.user?.user_metadata?.role, error)
        
        if (error) {
          console.error('Session check error:', error)
          if (mounted) setLoading(false)
          return
        }
        
        if (session?.user && mounted) {
          setUser(session.user)
          
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'customer'
          }
          setProfile(basicProfile)
          setLoading(false)
          
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
        console.log('No profile found, user should already have one from trigger')
        // Profile should be created by trigger, but if not, keep the basic one
      } else if (!error && profileData) {
        console.log('Profile fetched successfully:', profileData)
        setProfile(profileData)
      } else {
        console.error('Error fetching profile:', error)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
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
    console.log('Attempting sign up for:', email, 'with role:', userData.role)
    setLoading(true)
    
    try {
      // Send verification email first
      const redirectUrl = `${window.location.origin}/auth/login`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.name,
            role: userData.role,
            phone: userData.phone,
            ...(userData.role === 'shop_owner' && {
              shop_name: userData.shop_name,
              shop_category: userData.shop_category,
              shop_address: userData.shop_address,
              shop_lat: userData.shop_lat,
              shop_lng: userData.shop_lng,
            }),
            ...(userData.role === 'customer' && {
              latitude: userData.latitude,
              longitude: userData.longitude,
            }),
            ...(userData.role === 'delivery_partner' && {
              vehicle_type: userData.vehicle_type,
              latitude: userData.latitude,
              longitude: userData.longitude,
            }),
          }
        }
      })
      
      if (!error) {
        // Send verification email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: {
              email: email,
              confirmationUrl: redirectUrl,
              userType: userData.role,
              userName: userData.name
            }
          })
          
          if (emailError) {
            console.error('Failed to send verification email:', emailError)
          } else {
            console.log('Verification email sent successfully')
          }
        } catch (emailError) {
          console.error('Error sending verification email:', emailError)
        }
      }
      
      if (error) {
        console.error('Sign up error:', error)
        setLoading(false)
      }
      
      return { error }
    } catch (error) {
      console.error('Sign up failed:', error)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('Signing out user')
    
    try {
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
