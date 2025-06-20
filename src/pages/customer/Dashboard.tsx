
import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, MapPin, Package, User } from 'lucide-react'

const CustomerDashboard = () => {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Welcome back, {profile?.full_name || 'Customer'}!
          </h1>
          <p className="text-gray-600">What would you like to do today?</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/customer/shops">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-[#16A085]" />
                </div>
                <CardTitle className="text-[#2C3E50]">Browse Shops</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Discover local shops and restaurants near you
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/customer/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-[#16A085]" />
                </div>
                <CardTitle className="text-[#2C3E50]">My Orders</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Track your current and past orders
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-75">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-gray-500">Favorites</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 text-sm">
                Coming soon - Save your favorite shops
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-gray-500">Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 text-sm">
                Coming soon - Manage your profile
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2C3E50]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/customer/shops">
                <Button className="bg-[#16A085] hover:bg-[#16A085]/90">
                  Order Food
                </Button>
              </Link>
              <Link to="/customer/shops">
                <Button variant="outline">
                  Browse Grocery Stores
                </Button>
              </Link>
              <Link to="/customer/orders">
                <Button variant="outline">
                  Track Order
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerDashboard
