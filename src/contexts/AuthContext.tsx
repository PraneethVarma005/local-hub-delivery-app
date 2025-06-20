
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user && event === 'SIGNED_IN') {
          // Fetch or create user profile
          await fetchOrCreateProfile(session.user)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchOrCreateProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchOrCreateProfile = async (user: User) => {
    try {
      // Try to fetch existing profile
      let { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it from user metadata
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

        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          profileData = insertedProfile
        }
      }
      
      setProfile(profileData)
    } catch (error) {
      console.error('Error fetching/creating profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
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
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
