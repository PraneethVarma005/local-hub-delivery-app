import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import RoleSelector from '@/components/RoleSelector'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'shop_owner' | 'delivery_partner'>('customer')
  const { signIn, signInWithGoogle, user, userRole, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already authenticated, redirecting based on role:', userRole)
      
      // Check if user was trying to access a specific page
      const from = location.state?.from?.pathname
      if (from && from !== '/auth/login' && from !== '/auth/register') {
        navigate(from, { replace: true })
        return
      }
      
      // Default role-based redirect
      const dashboardPath = {
        'shop_owner': '/shop/dashboard',
        'delivery_partner': '/delivery/dashboard',
        'customer': '/customer/dashboard'
      }[userRole] || '/customer/dashboard'
      
      console.log('Redirecting to:', dashboardPath)
      navigate(dashboardPath, { replace: true })
    }
  }, [user, userRole, authLoading, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        toast({
          title: 'Login failed',
          description: error.message || 'Please check your credentials',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        })
        // Redirect will happen in useEffect when user state updates
      }
    } catch (error) {
      console.error('Login exception:', error)
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    
    try {
      const { error } = await signInWithGoogle(selectedRole)
      
      if (error) {
        console.error('Google login error:', error)
        toast({
          title: 'Google login failed',
          description: error.message || 'Please try again',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Google login exception:', error)
      toast({
        title: 'Google login failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2C3E50] dark:text-white">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your LocalHub account</p>
        </CardHeader>
        <CardContent>
          <RoleSelector 
            onRoleSelect={setSelectedRole} 
            selectedRole={selectedRole}
          />

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Signing in...' : `Continue with Google as ${selectedRole.replace('_', ' ')}`}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F7F9F9] dark:bg-gray-800 px-2 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="text-[#16A085] hover:underline font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
