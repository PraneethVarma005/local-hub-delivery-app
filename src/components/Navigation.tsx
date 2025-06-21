
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin } from 'lucide-react'

const Navigation = () => {
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    console.log('Navigation: Starting sign out process')
    await signOut()
    console.log('Navigation: Sign out completed, redirecting to home')
    navigate('/')
  }

  const getDashboardLink = () => {
    switch (userRole) {
      case 'customer':
        return '/customer/dashboard'
      case 'shop_owner':
        return '/shop/dashboard'
      case 'delivery_partner':
        return '/delivery/dashboard'
      default:
        return '/'
    }
  }

  return (
    <nav className="bg-[#2C3E50] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">            
            {/* Logo - Always goes to home */}
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-[#16A085]" />
              <span className="text-xl font-bold">LocalHub</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-white hover:text-[#16A085]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:text-[#16A085]"
                >
                  Profile
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-[#2C3E50]"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-white hover:text-[#16A085]"
                >
                  Login
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-[#16A085] hover:bg-[#16A085]/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
