
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
  const [processingAuth, setProcessingAuth] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (loading || processingAuth) return
      
      if (user && !processingAuth) {
        setProcessingAuth(true)
        
        try {
          console.log('OAuth user authenticated:', user.email)
          
          // Get role from URL params (for Google OAuth)
          const roleFromUrl = searchParams.get('role') || 'customer'
          
          // For Google OAuth users, check role conflicts
          if (user.app_metadata?.provider === 'google') {
            try {
              // Check if user already exists in users table with different role
              const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('role')
                .eq('email', user.email?.toLowerCase())
                .single()
              
              if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing user:', checkError)
                throw new Error('Database error while checking user')
              }
              
              if (existingUser && existingUser.role !== roleFromUrl) {
                // User exists with different role - this should not happen with proper DB constraints
                const roleDisplayName = existingUser.role.replace('_', ' ')
                toast({
                  title: 'Registration Error',
                  description: `This email is already registered as a ${roleDisplayName}. Please log in with that role or use a different email.`,
                  variant: 'destructive'
                })
                await supabase.auth.signOut()
                navigate('/auth/login', { replace: true })
                return
              }
              
              // If user doesn't exist, the trigger will handle creation
              console.log('Google OAuth user role check passed')
              
            } catch (error) {
              console.error('Error during Google OAuth role check:', error)
              toast({
                title: 'Authentication Error',
                description: 'There was an issue completing your sign in. Please try again.',
                variant: 'destructive'
              })
              await supabase.auth.signOut()
              navigate('/auth/login', { replace: true })
              return
            }
          }
          
          // Wait a moment for the database trigger to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Fetch the user's actual role from the database
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (roleError) {
            console.error('Error fetching user role after auth:', roleError)
            toast({
              title: 'Authentication Error',
              description: 'Could not determine your role. Please try logging in again.',
              variant: 'destructive'
            })
            await supabase.auth.signOut()
            navigate('/auth/login', { replace: true })
            return
          }
          
          const finalRole = userData.role
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
          await supabase.auth.signOut()
          navigate('/auth/login', { replace: true })
        } finally {
          setProcessingAuth(false)
        }
      } else if (!loading && !user) {
        console.log('No user found after OAuth, redirecting to login')
        navigate('/auth/login', { replace: true })
      }
    }

    handleAuthCallback()
  }, [user, userRole, loading, navigate, toast, searchParams, processingAuth])

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
