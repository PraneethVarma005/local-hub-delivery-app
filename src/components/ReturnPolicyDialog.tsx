
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ReturnPolicyDialogProps {
  userType: 'customer' | 'shop_owner' | 'delivery_partner'
  children: React.ReactNode
}

const ReturnPolicyDialog: React.FC<ReturnPolicyDialogProps> = ({ userType, children }) => {
  const getPolicyContent = () => {
    switch (userType) {
      case 'customer':
        return {
          title: 'Return Policy for Customers',
          content: `
            1. Order Cancellation:
            - Cancel orders within 5 minutes of placing
            - Full refund for cancelled orders
            - No cancellation once preparation starts

            2. Refund Policy:
            - Wrong or damaged items: Full refund
            - Missing items: Refund or replacement
            - Quality issues: Case-by-case evaluation
            - Refunds processed within 3-5 business days

            3. How to Request Refund:
            - Contact customer support immediately
            - Provide order details and issue description
            - Photo evidence for damaged items
            - Cooperate with investigation process

            4. Non-Refundable Items:
            - Perishable food items (unless damaged)
            - Custom or personalized orders
            - Orders consumed/used completely

            5. Dispute Resolution:
            - Direct communication with shop owner
            - Platform mediation if needed
            - Fair resolution for all parties
          `
        }
      case 'shop_owner':
        return {
          title: 'Return Policy for Shop Owners',
          content: `
            1. Order Management:
            - Accept or reject orders within 10 minutes
            - Update preparation time estimates
            - Communicate delays to customers
            - Handle order modifications requests

            2. Refund Responsibilities:
            - Issue refunds for shop errors
            - Cover costs for wrong items
            - Cooperate with quality investigations
            - Maintain food safety standards

            3. Quality Standards:
            - Ensure food safety and hygiene
            - Accurate menu descriptions
            - Proper packaging for delivery
            - Fresh ingredients and preparation

            4. Customer Complaints:
            - Respond promptly to issues
            - Work towards fair resolution
            - Learn from feedback
            - Maintain service quality

            5. Platform Support:
            - Platform assists in dispute resolution
            - Fair mediation process
            - Protect both shop and customer interests
          `
        }
      case 'delivery_partner':
        return {
          title: 'Service Terms for Delivery Partners',
          content: `
            1. Delivery Standards:
            - Accept deliveries within your capacity
            - Follow optimal routes provided
            - Handle orders with care
            - Maintain professional conduct

            2. Order Handling:
            - Verify order details before pickup
            - Ensure proper packaging
            - Deliver to correct address
            - Get delivery confirmation

            3. Issues and Resolution:
            - Report any delivery issues immediately
            - Cooperate with investigation process
            - Provide photo evidence when needed
            - Follow platform guidelines

            4. Performance Standards:
            - Maintain minimum acceptance rate
            - Complete deliveries on time
            - Provide excellent customer service
            - Keep vehicle information updated

            5. Dispute Resolution:
            - Fair review of delivery disputes
            - Platform support for resolution
            - Transparent rating system
            - Continuous improvement feedback
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

export default ReturnPolicyDialog
