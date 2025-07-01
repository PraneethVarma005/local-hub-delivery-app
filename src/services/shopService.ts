
import { supabase } from '@/lib/supabase'

export interface Shop {
  id: string
  shop_name: string
  shop_category: string
  shop_address: string
  shop_lat: number
  shop_lng: number
  full_name: string
  phone: string
  email: string
  average_rating?: number
  total_ratings?: number
  is_online: boolean
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  shop_id: string
  delivery_partner_id?: string
  items: any[]
  total_amount: number
  status: string
  pickup_address: string
  delivery_address: string
  pickup_lat?: number
  pickup_lng?: number
  delivery_lat?: number
  delivery_lng?: number
  estimated_delivery_time?: string
  created_at: string
  updated_at: string
}

export const shopService = {
  async getShops(category?: string) {
    try {
      console.log('Fetching shops with category:', category)
      
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('shop_category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching shops:', error)
        return []
      }

      console.log('Shops fetched successfully:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Exception in getShops:', error)
      return []
    }
  },

  async getShopById(id: string) {
    try {
      console.log('Fetching shop by ID:', id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'shop_owner')
        .single()

      if (error) {
        console.error('Error fetching shop by ID:', error)
        return null
      }

      console.log('Shop fetched by ID successfully')
      return data
    } catch (error) {
      console.error('Exception in getShopById:', error)
      return null
    }
  },

  async getNearbyShops(lat: number, lng: number, radiusKm: number = 10) {
    try {
      console.log('Fetching nearby shops for location:', { lat, lng, radiusKm })
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .not('shop_lat', 'is', null)
        .not('shop_lng', 'is', null)

      if (error) {
        console.error('Error fetching nearby shops:', error)
        return []
      }

      // Filter by distance on the client side
      const shopsWithDistance = (data || []).map(shop => {
        const distance = calculateDistance(lat, lng, shop.shop_lat, shop.shop_lng)
        return { ...shop, distance }
      }).filter(shop => shop.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)

      console.log('Nearby shops found:', shopsWithDistance.length)
      return shopsWithDistance
    } catch (error) {
      console.error('Exception in getNearbyShops:', error)
      return []
    }
  },

  async getOrders(userId?: string) {
    try {
      console.log('Fetching orders for user:', userId)
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.or(`customer_id.eq.${userId},shop_id.eq.${userId},delivery_partner_id.eq.${userId}`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        return []
      }

      console.log('Orders fetched successfully:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Exception in getOrders:', error)
      return []
    }
  },

  async createOrder(orderData: Partial<Order>) {
    try {
      console.log('Creating order:', orderData)
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        throw error
      }

      console.log('Order created successfully:', data.id)
      return data
    } catch (error) {
      console.error('Exception in createOrder:', error)
      throw error
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    try {
      console.log('Updating order status:', { orderId, status })
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Error updating order status:', error)
        throw error
      }

      console.log('Order status updated successfully')
      return data
    } catch (error) {
      console.error('Exception in updateOrderStatus:', error)
      throw error
    }
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c // Distance in kilometers
  return distance
}
