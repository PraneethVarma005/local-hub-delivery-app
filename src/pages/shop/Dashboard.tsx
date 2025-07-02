
import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, BarChart3, MessageSquare } from 'lucide-react'
import InventoryManagement from '@/components/InventoryManagement'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import ShopSetupForm from '@/components/ShopSetupForm'
import ShopOrdersManager from '@/components/ShopOrdersManager'
import { useLanguage } from '@/hooks/useLanguage'
import LanguageSelector from '@/components/LanguageSelector'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

const ShopDashboard = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [hasShop, setHasShop] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkShopExists()
    }
  }, [user])

  const checkShopExists = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('shop_owner_id', user?.id)
        .single()

      setHasShop(!!data)
    } catch (error) {
      console.error('Error checking shop:', error)
      setHasShop(false)
    } finally {
      setLoading(false)
    }
  }

  const handleShopCreated = () => {
    setHasShop(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasShop) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
                Welcome to LocalHub
              </h1>
              <p className="text-gray-600">Let's set up your shop to start selling</p>
            </div>
            <LanguageSelector />
          </div>
          <ShopSetupForm onShopCreated={handleShopCreated} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
              {t('dashboard')} - Shop Owner
            </h1>
            <p className="text-gray-600">Manage your shop and track performance</p>
          </div>
          <LanguageSelector />
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('inventory')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('analytics')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Orders & Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard userRole="shop_owner" />
          </TabsContent>

          <TabsContent value="orders">
            <ShopOrdersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ShopDashboard
