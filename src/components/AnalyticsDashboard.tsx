
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Users, Star, Clock, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface AnalyticsDashboardProps {
  userRole: 'shop_owner' | 'delivery_partner'
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userRole }) => {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [summaryStats, setSummaryStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadAnalytics()
      loadSummaryStats()
    }
  }, [user, userRole])

  const loadAnalytics = async () => {
    try {
      const tableName = userRole === 'shop_owner' ? 'shop_analytics' : 'delivery_analytics'
      const filterField = userRole === 'shop_owner' ? 'shop_id' : 'delivery_partner_id'
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(filterField, user?.id)
        .order('date', { ascending: true })
        .limit(30)

      if (error) throw error
      setAnalytics(data || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummaryStats = async () => {
    try {
      if (userRole === 'shop_owner') {
        // Load shop summary stats
        const [ordersResult, ratingsResult, inventoryResult] = await Promise.all([
          supabase.from('orders').select('*').eq('shop_id', user?.id),
          supabase.from('shop_ratings').select('rating').eq('shop_id', user?.id),
          supabase.from('shop_inventory').select('*').eq('shop_id', user?.id)
        ])

        const totalOrders = ordersResult.data?.length || 0
        const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const avgRating = ratingsResult.data?.length 
          ? ratingsResult.data.reduce((sum, r) => sum + r.rating, 0) / ratingsResult.data.length 
          : 0
        const totalProducts = inventoryResult.data?.length || 0

        setSummaryStats({
          totalOrders,
          totalRevenue,
          avgRating: avgRating.toFixed(1),
          totalProducts
        })
      } else {
        // Load delivery partner summary stats
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_partner_id', user?.id)

        const totalDeliveries = orders?.length || 0
        const totalEarnings = orders?.reduce((sum, order) => sum + (order.total_amount * 0.1), 0) || 0 // Assuming 10% commission
        
        setSummaryStats({
          totalDeliveries,
          totalEarnings,
          avgRating: 4.5, // Mock data
          hoursWorked: totalDeliveries * 0.5 // Mock calculation
        })
      }
    } catch (error) {
      console.error('Error loading summary stats:', error)
    }
  }

  const COLORS = ['#16A085', '#E74C3C', '#F39C12', '#3498DB']

  if (loading) {
    return <div className="text-center p-4">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userRole === 'shop_owner' ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#2C3E50]">{summaryStats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#16A085]">₹{summaryStats.totalRevenue?.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#F39C12]">{summaryStats.avgRating}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#2C3E50]">{summaryStats.totalProducts}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#2C3E50]">{summaryStats.totalDeliveries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#16A085]">₹{summaryStats.totalEarnings?.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#F39C12]">{summaryStats.avgRating}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hours Worked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#2C3E50]">{summaryStats.hoursWorked}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'shop_owner' ? 'Daily Revenue' : 'Daily Earnings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={userRole === 'shop_owner' ? 'total_revenue' : 'total_earnings'} 
                  stroke="#16A085" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'shop_owner' ? 'Daily Orders' : 'Daily Deliveries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={userRole === 'shop_owner' ? 'total_orders' : 'total_deliveries'} 
                  fill="#16A085" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
