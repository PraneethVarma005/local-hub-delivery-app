import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import AuthCallback from '@/pages/auth/Callback'
import Profile from '@/pages/Profile'
import CustomerDashboard from '@/pages/customer/Dashboard'
import ShopDashboard from '@/pages/shop/Dashboard'
import DeliveryDashboard from '@/pages/delivery/Dashboard'
import NotFound from '@/pages/NotFound'
import ShopList from '@/pages/customer/ShopList'
import ShopDetail from '@/pages/customer/ShopDetail'
import Checkout from '@/pages/customer/Checkout'
import Orders from '@/pages/customer/Orders'
import Favorites from '@/pages/customer/Favorites'
import AIChatPage from '@/pages/AIChat'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ai-chat" element={<AIChatPage />} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/customer/shops" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ShopList />
        </ProtectedRoute>
      } />
      <Route path="/customer/shop/:shopId" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ShopDetail />
        </ProtectedRoute>
      } />
      <Route path="/customer/checkout" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/customer/orders" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/customer/favorites" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Favorites />
        </ProtectedRoute>
      } />

      {/* Shop Owner Routes */}
      <Route path="/shop/dashboard" element={
        <ProtectedRoute allowedRoles={['shop_owner']}>
          <ShopDashboard />
        </ProtectedRoute>
      } />

      {/* Delivery Partner Routes */}
      <Route path="/delivery/dashboard" element={
        <ProtectedRoute allowedRoles={['delivery_partner']}>
          <DeliveryDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes