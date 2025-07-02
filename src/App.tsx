
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import { CartProvider } from "./contexts/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import FloatingChatbot from "./components/FloatingChatbot";
import AppRoutes from "./routes/AppRoutes";

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
                  <AppRoutes />
                  <FloatingChatbot />
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
