
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import LiveDeliveryTracker from '@/components/LiveDeliveryTracker'
import { ShoppingCart, MapPin, Package, User, Heart, Star, Bell } from 'lucide-react'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadActiveOrders()
    }
  }, [user])

  const loadActiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user?.id)
        .neq('status', 'delivered')
        .order('created_at', { ascending: false })

      if (error) throw error
      setActiveOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Customer'}!
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

        {/* Quick Stats - Empty counts as requested */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">0</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">0</div>
              <div className="text-sm text-gray-600">Favorite Shops</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#16A085] mb-1">₹0</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders - Live Tracking */}
        {activeOrders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-[#2C3E50] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <LiveDeliveryTracker key={order.id} orderId={order.id} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {activeOrders.length === 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-[#2C3E50] flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start browsing shops to see your activity here
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
