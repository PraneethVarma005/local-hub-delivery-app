
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
  average_rating: number
  total_ratings: number
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
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getShops:', error)
      throw error
    }
  },

  async getShopById(id: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'shop_owner')
        .single()

      if (error) {
        console.error('Error fetching shop:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getShopById:', error)
      throw error
    }
  },

  async getNearbyShops(lat: number, lng: number, radiusKm: number = 10) {
    try {
      // Using a simple distance calculation
      // In production, you might want to use PostGIS for more accurate results
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .not('shop_lat', 'is', null)
        .not('shop_lng', 'is', null)

      if (error) {
        console.error('Error fetching nearby shops:', error)
        throw error
      }

      // Filter by distance on the client side for now
      const shopsWithDistance = (data || []).map(shop => {
        const distance = calculateDistance(lat, lng, shop.shop_lat, shop.shop_lng)
        return { ...shop, distance }
      }).filter(shop => shop.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)

      return shopsWithDistance
    } catch (error) {
      console.error('Error in getNearbyShops:', error)
      throw error
    }
  },

  async getOrders(userId?: string) {
    try {
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
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getOrders:', error)
      throw error
    }
  },

  async createOrder(orderData: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createOrder:', error)
      throw error
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    try {
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

      return data
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
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
