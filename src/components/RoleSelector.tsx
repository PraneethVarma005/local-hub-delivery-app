
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, User, Truck } from 'lucide-react'

interface RoleSelectorProps {
  onRoleSelect: (role: 'customer' | 'shop_owner' | 'delivery_partner') => void
  selectedRole?: string
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect, selectedRole }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 text-center">
        Choose your role
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'customer' ? 'ring-2 ring-[#16A085] bg-[#16A085]/5' : ''
          }`}
          onClick={() => onRoleSelect('customer')}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-2">
              <User className="w-6 h-6 text-[#16A085]" />
            </div>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-sm text-gray-600">
              Order from local shops
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'shop_owner' ? 'ring-2 ring-[#16A085] bg-[#16A085]/5' : ''
          }`}
          onClick={() => onRoleSelect('shop_owner')}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-2">
              <Store className="w-6 h-6 text-[#16A085]" />
            </div>
            <CardTitle className="text-base">Shop Owner</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-sm text-gray-600">
              Manage your shop
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'delivery_partner' ? 'ring-2 ring-[#16A085] bg-[#16A085]/5' : ''
          }`}
          onClick={() => onRoleSelect('delivery_partner')}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-2">
              <Truck className="w-6 h-6 text-[#16A085]" />
            </div>
            <CardTitle className="text-base">Delivery Partner</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-sm text-gray-600">
              Deliver orders
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RoleSelector
