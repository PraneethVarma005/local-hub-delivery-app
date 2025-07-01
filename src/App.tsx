import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import { CartProvider } from "./contexts/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/Callback";
import Profile from "./pages/Profile";
import CustomerDashboard from "./pages/customer/Dashboard";
import ShopDashboard from "./pages/shop/Dashboard";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import NotFound from "./pages/NotFound";
import ShopList from "./pages/customer/ShopList";
import ShopDetail from "./pages/customer/ShopDetail";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import Favorites from "./pages/customer/Favorites";
import AIChatPage from "./pages/AIChat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <div className="min-h-screen w-full">
                  <Navigation />
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
                </div>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
