
import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, MapPin, Package, User, Heart, Star, Bell } from 'lucide-react'

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

          <Link to="/customer/favorites">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-[#16A085]" />
                </div>
                <CardTitle className="text-[#2C3E50]">Favorites</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Your favorite shops and restaurants
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-[#16A085]" />
                </div>
                <CardTitle className="text-[#2C3E50]">Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Manage your profile and settings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">12</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">5</div>
              <div className="text-sm text-gray-600">Favorite Shops</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">₹2,450</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[#2C3E50] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Order Delivered</p>
                  <p className="text-sm text-green-600">Your order from Fresh Mart Grocery has been delivered</p>
                </div>
                <span className="text-xs text-green-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">New Favorite Added</p>
                  <p className="text-sm text-blue-600">You added Spice Kitchen to your favorites</p>
                </div>
                <span className="text-xs text-blue-500 ml-auto">1 day ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Star className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Review Submitted</p>
                  <p className="text-sm text-orange-600">You rated Pizza Corner 5 stars</p>
                </div>
                <span className="text-xs text-orange-500 ml-auto">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Link to="/customer/favorites">
                <Button variant="outline">
                  View Favorites
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
