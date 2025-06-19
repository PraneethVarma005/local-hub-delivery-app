
import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  userRole: 'customer' | 'shop_owner' | 'delivery_partner' | null
  loading: boolean
  signIn: (email: string, password: string, role: string) => Promise<void>
  signUp: (email: string, password: string, role: string, userData: any) => Promise<void>
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
  const [userRole, setUserRole] = useState<'customer' | 'shop_owner' | 'delivery_partner' | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string, role: string) => {
    // Mock authentication - just set user data
    setUser({ id: '1', email })
    setUserRole(role as 'customer' | 'shop_owner' | 'delivery_partner')
  }

  const signUp = async (email: string, password: string, role: string, userData: any) => {
    // Mock authentication - just set user data
    setUser({ id: '1', email })
    setUserRole(role as 'customer' | 'shop_owner' | 'delivery_partner')
  }

  const signOut = async () => {
    setUser(null)
    setUserRole(null)
  }

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
