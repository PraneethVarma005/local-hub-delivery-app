
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PrivacyPolicyDialogProps {
  userType: 'customer' | 'shop_owner' | 'delivery_partner'
  children: React.ReactNode
}

const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({ userType, children }) => {
  const getPolicyContent = () => {
    switch (userType) {
      case 'customer':
        return {
          title: 'Privacy Policy for Customers',
          content: `
            1. Information We Collect:
            - Personal information (name, email, phone number)
            - Delivery addresses and location data
            - Order history and preferences
            - Device information and usage patterns

            2. How We Use Your Information:
            - Process and deliver your orders
            - Communicate order status and updates
            - Improve our services and recommendations
            - Provide customer support

            3. Information Sharing:
            - We share delivery information with partner shops and delivery personnel
            - We do not sell your personal information to third parties
            - Location data is shared only for order fulfillment

            4. Data Security:
            - We use encryption to protect your data
            - Regular security audits and updates
            - Secure payment processing

            5. Your Rights:
            - Access and update your information
            - Delete your account and data
            - Opt out of marketing communications
          `
        }
      case 'shop_owner':
        return {
          title: 'Privacy Policy for Shop Owners',
          content: `
            1. Information We Collect:
            - Business information (shop name, address, category)
            - Owner contact details
            - Menu items and pricing
            - Order and sales data
            - Customer reviews and ratings

            2. How We Use Your Information:
            - Display your shop to customers
            - Process orders and payments
            - Generate sales reports and analytics
            - Facilitate customer communication

            3. Information Sharing:
            - Shop information is public to customers
            - Order details shared with delivery partners
            - Aggregated data for platform improvements

            4. Business Data:
            - You retain ownership of your menu and pricing
            - Sales data belongs to you
            - We provide analytics and insights

            5. Your Rights:
            - Update shop information anytime
            - Download your business data
            - Close your shop account
          `
        }
      case 'delivery_partner':
        return {
          title: 'Privacy Policy for Delivery Partners',
          content: `
            1. Information We Collect:
            - Personal and contact information
            - Vehicle type and license details
            - Real-time location during deliveries
            - Delivery history and performance metrics

            2. How We Use Your Information:
            - Match you with delivery opportunities
            - Track delivery progress for customers
            - Calculate earnings and payments
            - Ensure service quality

            3. Location Tracking:
            - Location tracked only during active deliveries
            - Used to update customers on delivery status
            - Helps optimize delivery routes

            4. Earnings and Payments:
            - Transparent payment calculations
            - Secure payment processing
            - Detailed earning statements

            5. Your Rights:
            - Control your availability status
            - Access your delivery history
            - Update your information
            - Delete your account
          `
        }
    }
  }

  const policy = getPolicyContent()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{policy.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {policy.content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default PrivacyPolicyDialog
