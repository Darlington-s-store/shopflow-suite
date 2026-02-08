import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { OrderProvider } from "@/contexts/OrderContext";

import { ReviewProvider } from "@/contexts/ReviewContext";
import { ProductManagementProvider } from "@/contexts/ProductManagementContext";
import { CustomerManagementProvider } from "@/contexts/CustomerManagementContext";
import { StoreLayout } from "@/components/layout/StoreLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetail from "./pages/products/ProductDetail";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmation from "./pages/checkout/OrderConfirmation";
import NotFound from "./pages/NotFound";

// User Dashboard
import UserDashboard from "./pages/user/UserDashboard";
import UserOrders from "./pages/user/UserOrders";
import UserWishlist from "./pages/user/UserWishlist";
import UserReviews from "./pages/user/UserReviews";
import UserProfile from "./pages/user/UserProfile";
import UserNotifications from "./pages/user/UserNotifications";
import UserAddresses from "./pages/user/UserAddresses";
import UserSettings from "./pages/user/UserSettings";

// Admin Dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategoriesPage from "./pages/admin/categories/AdminCategoriesPage";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AddProduct from "./pages/admin/products/AddProduct";
import EditProduct from "./pages/admin/products/EditProduct";
import ProductImageManagement from "./pages/admin/products/ProductImageManagement";
import CustomerDetailsPage from "./pages/admin/customers/CustomerDetailsPage";
import CategoryFormPage from "./pages/admin/categories/CategoryFormPage";
import SubCategoriesPage from "./pages/admin/categories/SubCategoriesPage";
import AdminBrandsPage from "./pages/admin/brands/AdminBrandsPage";
import BrandFormPage from "./pages/admin/brands/BrandFormPage";
import { AdminDealsPage } from "./pages/admin/deals/AdminDealsPage";
import { AdminMessagesPage } from "./pages/admin/messages/AdminMessagesPage";
import { AdminNotificationsPage } from "./pages/admin/notifications/AdminNotificationsPage";
import { AdminChatbotPage } from "./pages/admin/chatbot/AdminChatbotPage";

// Rider Dashboard
import RiderDashboard from "./pages/rider/RiderDashboard";

// Public Pages
import TrackOrder from "./pages/public/TrackOrder";
import ContactUs from "./pages/public/ContactUs";
import DealsPage from "./pages/public/DealsPage";
import FAQPage from "./pages/public/FAQPage";
import AboutUs from "./pages/public/AboutUs";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsConditions from "./pages/public/TermsConditions";
import ReturnPolicy from "./pages/public/ReturnPolicy";
import ShippingInfo from "./pages/public/ShippingInfo";

const queryClient = new QueryClient();

// Protected route wrapper for user dashboard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Protected route wrapper for admin dashboard
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Store Routes */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/search" element={<ProductsPage />} />
        <Route path="/category/:slug" element={<ProductsPage />} />
        <Route path="/brand/:slug" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/products/:slug" element={<ProductDetail />} /> {/* Handle plural URL */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/wishlist" element={<UserWishlist />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/returns" element={<ReturnPolicy />} />
        <Route path="/shipping" element={<ShippingInfo />} />
      </Route>

      {/* User Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StoreLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<UserDashboard />}>
          <Route index element={null} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="orders/:orderId" element={<UserOrders />} />
          <Route path="wishlist" element={<UserWishlist />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="addresses" element={<UserAddresses />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      >
        <Route index element={null} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:productId" element={<EditProduct />} />
        <Route path="products/:productId/images" element={<ProductImageManagement />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/add" element={<CategoryFormPage />} />
        <Route path="categories/edit/:categoryId" element={<CategoryFormPage />} />
        <Route path="categories/:categoryId/subcategories" element={<SubCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="brands/add" element={<BrandFormPage />} />
        <Route path="brands/edit/:brandId" element={<BrandFormPage />} />
        <Route path="deals" element={<AdminDealsPage />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:customerId" element={<CustomerDetailsPage />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Rider Dashboard Routes */}
      <Route
        path="/rider"
        element={
          <ProtectedRoute>
            <RiderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductManagementProvider>

        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <ReviewProvider>
                <CustomerManagementProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AppRoutes />
                    </BrowserRouter>
                  </TooltipProvider>
                </CustomerManagementProvider>
              </ReviewProvider>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductManagementProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
