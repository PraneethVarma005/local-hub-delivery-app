
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F7F9F9]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#2C3E50] to-[#16A085] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              LocalHub Delivery
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-gray-200">
              Connect with nearby local shops for instant delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button className="bg-[#F39C12] hover:bg-[#F39C12]/90 text-black px-8 py-3 text-lg">
                  Order Now
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-[#2C3E50] px-8 py-3 text-lg"
                >
                  Join as Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">
            How LocalHub Works
          </h2>
          <p className="text-gray-600 text-lg">
            Simple, fast, and reliable local delivery
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-[#16A085] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">
                Find Nearby Shops
              </h3>
              <p className="text-gray-600">
                Discover local food, grocery, and medicine shops within 5-10km radius
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-[#F39C12] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">
                Order & Pay
              </h3>
              <p className="text-gray-600">
                Browse products, add to cart, and pay online or cash on delivery
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-[#2C3E50] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚴</span>
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Track your order in real-time and get it delivered to your doorstep
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need from local shops
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group cursor-pointer hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🍕</div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">
                  Food
                </h3>
                <p className="text-gray-600">
                  Restaurants, cafes, and local food vendors
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🥬</div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">
                  Grocery
                </h3>
                <p className="text-gray-600">
                  Fresh vegetables, fruits, and daily essentials
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">
                  Medicine
                </h3>
                <p className="text-gray-600">
                  Pharmacies and medical stores near you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2C3E50] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of customers enjoying fast local delivery
          </p>
          <Link to="/auth/register">
            <Button className="bg-[#16A085] hover:bg-[#16A085]/90 px-8 py-3 text-lg">
              Start Ordering Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
