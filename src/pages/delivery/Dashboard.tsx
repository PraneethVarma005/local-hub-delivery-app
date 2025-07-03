
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, MapPin, MessageSquare } from 'lucide-react'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import DeliveryOrdersManager from '@/components/DeliveryOrdersManager'
import ChatSystem from '@/components/ChatSystem'

const DeliveryDashboard = () => {
  

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
              Dashboard - Delivery Partner
            </h1>
            <p className="text-gray-600">Track your deliveries and earnings</p>
          </div>
          
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Active Deliveries
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard userRole="delivery_partner" />
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveryOrdersManager />
          </TabsContent>

          <TabsContent value="chat">
            <ChatSystem userRole="delivery_partner" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DeliveryDashboard
