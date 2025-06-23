
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

const InventoryManagement = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'food',
    image_url: ''
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadInventory()
    }
  }, [user])

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        shop_id: user.id
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('shop_inventory')
          .update(productData)
          .eq('id', editingProduct.id)
        
        if (error) throw error
        toast({ title: 'Product updated successfully' })
      } else {
        const { error } = await supabase
          .from('shop_inventory')
          .insert(productData)
        
        if (error) throw error
        toast({ title: 'Product added successfully' })
      }

      resetForm()
      loadInventory()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category: 'food',
      image_url: ''
    })
    setEditingProduct(null)
  }

  const editProduct = (product: any) => {
    setFormData({
      product_name: product.product_name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category,
      image_url: product.image_url || ''
    })
    setEditingProduct(product)
  }

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('shop_inventory')
        .delete()
        .eq('id', productId)

      if (error) throw error
      toast({ title: 'Product deleted successfully' })
      loadInventory()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      })
    }
  }

  const toggleAvailability = async (product: any) => {
    try {
      const { error } = await supabase
        .from('shop_inventory')
        .update({ is_available: !product.is_available })
        .eq('id', product.id)

      if (error) throw error
      loadInventory()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div className="text-center p-4">Loading inventory...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Product Name"
                value={formData.product_name}
                onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="food">Food</option>
                <option value="groceries">Groceries</option>
                <option value="medicine">Medicine</option>
              </select>
            </div>
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              <Input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                required
              />
              <Input
                placeholder="Image URL (optional)"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#16A085] hover:bg-[#16A085]/90">
                <Plus className="h-4 w-4 mr-1" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              {editingProduct && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{product.product_name}</h3>
                    <Badge variant={product.is_available ? "default" : "secondary"}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                    <Badge className="capitalize">{product.category}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">₹{product.price}</span>
                    <span>Stock: {product.stock_quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(product)}
                  >
                    {product.is_available ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default InventoryManagement
