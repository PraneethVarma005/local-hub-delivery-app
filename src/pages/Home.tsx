
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, ShoppingCart, Truck, Store } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Home = () => {
  const { user, userRole } = useAuth()

  const getDashboardLink = () => {
    switch (userRole) {
      case 'customer':
        return '/customer/dashboard'
      case 'shop_owner':
        return '/shop/dashboard'
      case 'delivery_partner':
        return '/delivery/dashboard'
      default:
        return '/auth/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9F9] to-[#E8F4F8]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#2C3E50] mb-6">
            Welcome to LocalHub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your neighborhood marketplace. Discover local shops, order from nearby stores, 
            and get everything delivered to your doorstep.
          </p>
          
          {user ? (
            <Link to={getDashboardLink()}>
              <Button size="lg" className="bg-[#16A085] hover:bg-[#16A085]/90 text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="bg-[#16A085] hover:bg-[#16A085]/90 text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-[#16A085]" />
              </div>
              <CardTitle className="text-[#2C3E50]">Shop Local</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse and order from your favorite local shops and restaurants. 
                Support your neighborhood businesses.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-[#16A085]" />
              </div>
              <CardTitle className="text-[#2C3E50]">Fast Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get your orders delivered quickly by our network of local delivery partners. 
                Track your order in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-[#16A085]" />
              </div>
              <CardTitle className="text-[#2C3E50]">Easy Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Shop owners can easily manage inventory, track orders, and grow their business 
                with our comprehensive dashboard.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">
            Ready to join LocalHub?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Whether you're a customer, shop owner, or delivery partner, we have something for you.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-[#2C3E50] mb-2">For Customers</h3>
              <p className="text-gray-600 text-sm mb-4">Order from local shops with easy delivery</p>
              <Link to="/auth/register?role=customer">
                <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90">
                  Sign Up as Customer
                </Button>
              </Link>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-[#2C3E50] mb-2">For Shop Owners</h3>
              <p className="text-gray-600 text-sm mb-4">List your shop and manage orders online</p>
              <Link to="/auth/register?role=shop_owner">
                <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90">
                  Sign Up as Shop Owner
                </Button>
              </Link>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-[#2C3E50] mb-2">For Delivery Partners</h3>
              <p className="text-gray-600 text-sm mb-4">Earn money by delivering orders</p>
              <Link to="/auth/register?role=delivery_partner">
                <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90">
                  Sign Up as Delivery Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
