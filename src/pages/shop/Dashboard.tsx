
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

interface Order {
  id: string
  customerName: string
  items: string[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  orderTime: string
}

const ShopDashboard = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'food'
  })

  // Mock data
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh tomato sauce, mozzarella, basil',
        price: 12.99,
        category: 'food',
        available: true
      },
      {
        id: '2',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, parmesan, croutons',
        price: 8.99,
        category: 'food',
        available: true
      }
    ]

    const mockOrders: Order[] = [
      {
        id: '1',
        customerName: 'John Doe',
        items: ['Margherita Pizza', 'Caesar Salad'],
        total: 21.98,
        status: 'pending',
        orderTime: '2:30 PM'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        items: ['Margherita Pizza'],
        total: 12.99,
        status: 'preparing',
        orderTime: '2:15 PM'
      }
    ]

    setProducts(mockProducts)
    setOrders(mockOrders)
  }, [])

  const addProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      const product: Product = {
        id: Date.now().toString(),
        ...newProduct,
        available: true
      }
      setProducts([...products, product])
      setNewProduct({ name: '', description: '', price: 0, category: 'food' })
    }
  }

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'preparing': return 'bg-blue-500'
      case 'ready': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'preparing': return <Package className="h-4 w-4" />
      case 'ready': return <CheckCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Shop Dashboard
          </h1>
          <p className="text-gray-600">Manage your shop and orders</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <p className="text-gray-600">{order.customerName} • {order.orderTime}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Items:</p>
                      <ul className="list-disc list-inside text-sm">
                        {order.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
                      <div className="space-x-2">
                        {order.status === 'pending' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="bg-[#16A085] hover:bg-[#16A085]/90"
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="bg-[#16A085] hover:bg-[#16A085]/90"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            variant="outline"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <Input
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
                <div className="flex gap-2">
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="food">Food</option>
                    <option value="grocery">Grocery</option>
                    <option value="medicine">Medicine</option>
                  </select>
                  <Button onClick={addProduct} className="bg-[#16A085] hover:bg-[#16A085]/90">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                        <Badge className="mt-2 capitalize">{product.category}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#2C3E50]">${product.price.toFixed(2)}</p>
                        <Badge variant={product.available ? "default" : "secondary"}>
                          {product.available ? 'Available' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Today's Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#2C3E50]">{orders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#16A085]">
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#2C3E50]">
                    {products.filter(p => p.available).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ShopDashboard
