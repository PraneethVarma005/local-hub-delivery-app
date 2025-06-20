
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Star, Clock, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import GoogleMap from '@/components/GoogleMap'

// Mock data for initial display
const mockShops = [
  {
    id: '1',
    name: 'Fresh Mart Grocery',
    category: 'grocery',
    address: '123 Main Street, Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    phone: '+91 9876543210',
    is_open: true,
    rating: 4.5,
    total_reviews: 128,
    delivery_fee: 25,
    minimum_order_amount: 200,
    image_url: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Spice Kitchen',
    category: 'food',
    address: '456 Food Street, Delhi',
    latitude: 28.6129,
    longitude: 77.2095,
    phone: '+91 9876543211',
    is_open: true,
    rating: 4.2,
    total_reviews: 89,
    delivery_fee: 30,
    minimum_order_amount: 150,
    image_url: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'HealthCare Pharmacy',
    category: 'medicine',
    address: '789 Health Avenue, Delhi',
    latitude: 28.6149,
    longitude: 77.2085,
    phone: '+91 9876543212',
    is_open: false,
    rating: 4.8,
    total_reviews: 256,
    delivery_fee: 20,
    minimum_order_amount: 100,
    image_url: '/placeholder.svg'
  }
]

const ShopList = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Shops' },
    { id: 'food', name: 'Food & Restaurants' },
    { id: 'grocery', name: 'Grocery' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'pharmacy', name: 'Pharmacy' }
  ]

  const filteredShops = selectedCategory === 'all' 
    ? mockShops 
    : mockShops.filter(shop => shop.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-500'
      case 'grocery': return 'bg-green-500'
      case 'medicine': return 'bg-blue-500'
      case 'pharmacy': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-4">Browse Shops</h1>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "bg-[#16A085] hover:bg-[#16A085]/90" : ""}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <TabsContent value="list" className="space-y-4">
              {filteredShops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No shops found in this category</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map((shop) => (
                    <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(shop.category)}>
                              {shop.category}
                            </Badge>
                            <Badge variant={shop.is_open ? "default" : "secondary"}>
                              {shop.is_open ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-[#2C3E50]">{shop.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{shop.rating}</span>
                          <span>({shop.total_reviews} reviews)</span>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                            <span className="text-sm text-gray-600">{shop.address}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{shop.phone}</span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Delivery: ₹{shop.delivery_fee}</span>
                            <span>Min order: ₹{shop.minimum_order_amount}</span>
                          </div>

                          <Link to={`/customer/shop/${shop.id}`}>
                            <Button 
                              className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                              disabled={!shop.is_open}
                            >
                              {shop.is_open ? 'View Shop' : 'Currently Closed'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <div className="bg-white rounded-lg p-4">
                <GoogleMap
                  shops={filteredShops}
                  height="500px"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ShopList
