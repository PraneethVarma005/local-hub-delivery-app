
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute check:', {
    hasUser: !!user,
    loading,
    userRole,
    allowedRoles,
    currentPath: location.pathname
  })

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
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  // Strict role checking - user can only access their designated role
  if (!allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: Role not allowed. User role:', userRole, 'Allowed:', allowedRoles)
    
    // Redirect to the user's correct dashboard based on their actual role
    const dashboardPath = {
      'customer': '/customer/dashboard',
      'shop_owner': '/shop/dashboard', 
      'delivery_partner': '/delivery/dashboard'
    }[userRole] || '/customer/dashboard'
    
    console.log('Redirecting to user\'s role dashboard:', dashboardPath)
    return <Navigate to={dashboardPath} replace />
  }

  console.log('ProtectedRoute: Access granted for role:', userRole)
  return <>{children}</>
}

export default ProtectedRoute
