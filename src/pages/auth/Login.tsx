
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/hooks/useLanguage'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (user && profile) {
      console.log('User authenticated, redirecting based on role:', profile.role)
      
      const dashboardPath = profile.role === 'customer' ? '/customer/dashboard' 
        : profile.role === 'shop_owner' ? '/shop/dashboard' 
        : '/delivery/dashboard'
      
      navigate(dashboardPath, { replace: true })
    }
  }, [user, profile, navigate])

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
        // Navigation will be handled by useEffect once profile is loaded
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

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <CardTitle className="text-2xl font-bold text-[#2C3E50]">
              {t('welcomeBack')}
            </CardTitle>
            <LanguageSelector />
          </div>
          <p className="text-gray-600">{t('signInToAccount')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder={`Enter your ${t('email').toLowerCase()}`}
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder={`Enter your ${t('password').toLowerCase()}`}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
            >
              {loading ? 'Signing in...' : t('signIn')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('dontHaveAccount')}{' '}
              <Link
                to="/auth/register"
                className="text-[#16A085] hover:underline font-medium"
              >
                {t('signUpHere')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
