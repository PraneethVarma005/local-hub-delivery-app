import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CustomerDashboard from "./pages/customer/Dashboard";
import ShopDashboard from "./pages/shop/Dashboard";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import NotFound from "./pages/NotFound";
import ShopList from "./pages/customer/ShopList";
import ShopDetail from "./pages/customer/ShopDetail";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <div className="min-h-screen w-full">
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/shops" element={<ShopList />} />
                <Route path="/customer/shop/:shopId" element={<ShopDetail />} />
                <Route path="/customer/checkout" element={<Checkout />} />
                <Route path="/customer/orders" element={<Orders />} />
                <Route path="/shop/dashboard" element={<ShopDashboard />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
