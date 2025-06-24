
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { 
  Home, 
  Store, 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu,
  Heart,
  MapPin,
  Bell
} from 'lucide-react'

const Navigation = () => {
  const { user, signOut, userRole } = useAuth()
  const location = useLocation()
  const { requestPermission, subscribeToNotifications, permission } = usePushNotifications()

  useEffect(() => {
    if (user && permission !== 'granted') {
      requestPermission()
    }
  }, [user])

  useEffect(() => {
    if (user && permission === 'granted') {
      subscribeToNotifications()
    }
  }, [user, permission])

  const isActive = (path: string) => location.pathname === path

  const getNavItems = () => {
    if (!user) return []

    switch (userRole) {
      case 'customer':
        return [
          { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
          { path: '/customer/shops', label: 'Shops', icon: Store },
          { path: '/customer/orders', label: 'Orders', icon: ShoppingBag },
          { path: '/customer/favorites', label: 'Favorites', icon: Heart },
        ]
      case 'shop_owner':
        return [
          { path: '/shop/dashboard', label: 'Dashboard', icon: Home },
        ]
      case 'delivery_partner':
        return [
          { path: '/delivery/dashboard', label: 'Dashboard', icon: Home },
        ]
      default:
        return []
    }
  }

  const handleNotificationToggle = async () => {
    if (permission === 'granted') {
      // Notification is already enabled
    } else {
      await requestPermission()
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#16A085] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-[#2C3E50]">LocalHub</span>
          </Link>

          {/* Navigation Items */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {getNavItems().map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#16A085] text-white'
                        : 'text-gray-600 hover:text-[#16A085] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right Side Items */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationToggle}
                  className={`${permission === 'granted' ? 'text-[#16A085]' : 'text-gray-400'}`}
                >
                  <Bell className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            )}
            
            {!user && (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="bg-[#16A085] hover:bg-[#16A085]/90">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {getNavItems().map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-3 rounded-md text-xs ${
                    isActive(item.path)
                      ? 'text-[#16A085]'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
