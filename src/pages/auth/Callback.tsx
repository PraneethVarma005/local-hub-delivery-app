
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, userRole, loading } = useAuth()
  const { toast } = useToast()
  const [profileCreated, setProfileCreated] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!loading && user && !profileCreated) {
        try {
          console.log('OAuth user authenticated:', user.email)
          
          // Get role from URL params (for Google OAuth)
          const roleFromUrl = searchParams.get('role') || 'customer'
          
          // For Google OAuth users, check if they already have a role
          if (user.app_metadata?.provider === 'google') {
            try {
              // Check if user already exists in users table
              const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('role')
                .eq('email', user.email?.toLowerCase())
                .single()
              
              if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing user:', checkError)
              }
              
              if (existingUser && existingUser.role !== roleFromUrl) {
                // User exists with different role
                toast({
                  title: 'Registration Error',
                  description: `This email is already registered as a ${existingUser.role.replace('_', ' ')}. Please log in or use a different email.`,
                  variant: 'destructive'
                })
                await supabase.auth.signOut()
                navigate('/auth/login', { replace: true })
                return
              }
              
              // If user doesn't exist or role matches, proceed
              console.log('Google OAuth user role check passed')
              setProfileCreated(true)
              
            } catch (error) {
              console.error('Error during Google OAuth role check:', error)
              toast({
                title: 'Authentication Error',
                description: 'There was an issue completing your sign in. Please try again.',
                variant: 'destructive'
              })
              navigate('/auth/login', { replace: true })
              return
            }
          }
          
          const finalRole = userRole || roleFromUrl
          let dashboardPath = '/customer/dashboard'
          
          if (finalRole === 'shop_owner') {
            dashboardPath = '/shop/dashboard'
          } else if (finalRole === 'delivery_partner') {
            dashboardPath = '/delivery/dashboard'
          }
          
          toast({
            title: 'Welcome!',
            description: 'You have successfully signed in.',
          })
          
          console.log('Redirecting to:', dashboardPath, 'for role:', finalRole)
          navigate(dashboardPath, { replace: true })
          
        } catch (error) {
          console.error('Error in auth callback:', error)
          toast({
            title: 'Authentication Error',
            description: 'There was an issue completing your sign in. Please try again.',
            variant: 'destructive'
          })
          navigate('/auth/login', { replace: true })
        }
      } else if (!loading && !user) {
        console.log('No user found after OAuth, redirecting to login')
        navigate('/auth/login', { replace: true })
      }
    }

    handleAuthCallback()
  }, [user, userRole, loading, navigate, toast, searchParams, profileCreated])

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
