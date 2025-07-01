
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { user, userRole, loading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('OAuth user authenticated, redirecting based on role:', userRole)
        
        let dashboardPath = '/customer/dashboard'
        
        if (userRole === 'shop_owner') {
          dashboardPath = '/shop/dashboard'
        } else if (userRole === 'delivery_partner') {
          dashboardPath = '/delivery/dashboard'
        }
        
        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in with Google.',
        })
        
        console.log('Redirecting to:', dashboardPath)
        navigate(dashboardPath, { replace: true })
      } else {
        console.log('No user found after OAuth, redirecting to login')
        navigate('/auth/login', { replace: true })
      }
    }
  }, [user, userRole, loading, navigate, toast])

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085] mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
