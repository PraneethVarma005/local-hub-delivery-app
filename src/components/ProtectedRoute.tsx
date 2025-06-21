
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth()

  console.log('ProtectedRoute: user =', !!user, 'profile =', !!profile, 'loading =', loading, 'role =', profile?.role)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login')
    return <Navigate to="/auth/login" replace />
  }

  if (!profile) {
    console.log('ProtectedRoute: No profile, showing loading or creating one')
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(profile.role)) {
    console.log('ProtectedRoute: Role not allowed, redirecting to appropriate dashboard')
    // Redirect to appropriate dashboard based on user role
    const redirectPath = profile.role === 'customer' ? '/customer/dashboard' 
      : profile.role === 'shop_owner' ? '/shop/dashboard' 
      : '/delivery/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  console.log('ProtectedRoute: Access granted')
  return <>{children}</>
}

export default ProtectedRoute
