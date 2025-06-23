
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, BarChart3, MessageSquare } from 'lucide-react'
import InventoryManagement from '@/components/InventoryManagement'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { useLanguage } from '@/hooks/useLanguage'
import LanguageSelector from '@/components/LanguageSelector'

const ShopDashboard = () => {
  const { t } = useLanguage()

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
            <div className="text-center py-12">
              <p className="text-gray-500">Order management coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ShopDashboard
