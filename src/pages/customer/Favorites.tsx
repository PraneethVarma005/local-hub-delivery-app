
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Clock, Star, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock favorites data
const mockFavorites = [
  {
    id: 'shop_001',
    name: 'Fresh Mart Grocery',
    category: 'grocery',
    description: 'Fresh vegetables, fruits, and daily essentials',
    address: '123 Main Street, Delhi',
    rating: 4.5,
    deliveryTime: '25-35 min',
    deliveryFee: 25,
    isOpen: true,
    addedAt: '2024-01-15'
  },
  {
    id: 'shop_002',
    name: 'Spice Kitchen',
    category: 'food',
    description: 'Authentic Indian cuisine and street food',
    address: '456 Park Avenue, Delhi',
    rating: 4.7,
    deliveryTime: '30-40 min',
    deliveryFee: 30,
    isOpen: true,
    addedAt: '2024-01-10'
  }
]

const Favorites = () => {
  const [favorites, setFavorites] = useState(mockFavorites)
  const { toast } = useToast()

  const removeFavorite = (shopId: string, shopName: string) => {
    setFavorites(prev => prev.filter(shop => shop.id !== shopId))
    toast({
      title: "Removed from Favorites",
      description: `${shopName} has been removed from your favorites.`,
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-600">Your favorite shops and restaurants</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-4">Start adding shops to your favorites to see them here</p>
            <Link to="/customer/shops">
              <Button className="bg-[#16A085] hover:bg-[#16A085]/90">
                Browse Shops
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {favorites.map(shop => (
              <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={`${
                        shop.category === 'food' ? 'bg-orange-500' :
                        shop.category === 'grocery' ? 'bg-green-500' :
                        'bg-blue-500'
                      } text-white`}
                    >
                      {shop.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant={shop.isOpen ? "default" : "secondary"}>
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                      <Button
                        onClick={() => removeFavorite(shop.id, shop.name)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-[#2C3E50] text-lg">{shop.name}</CardTitle>
                  <p className="text-sm text-gray-600">{shop.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {shop.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {shop.deliveryTime} • ₹{shop.deliveryFee} delivery
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{shop.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Added {new Date(shop.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/customer/shop/${shop.id}`} className="flex-1">
                      <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
