import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import ScrollToTop from './components/common/ScrollToTop'; // Bạn đã import rất chuẩn

// --- IMPORT COMPONENTS ---
import Layout from './components/common/Layout';

// --- IMPORT GLOBAL CSS ---
import './App.css';

import LoadingSpinner from './components/common/LoadingSpinner';

// --- LAZY LOAD PUBLIC PAGES ---

const HomePage = React.lazy(() => import('./pages/public/HomePage'));
const ListingPage = React.lazy(() => import('./pages/public/ListingPage'));
const HotelDetailPage = React.lazy(() => import('./pages/public/HotelDetailPage'));
const AboutPage = React.lazy(() => import('./pages/public/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/public/ContactPage'));
const PromotionsPage = React.lazy(() => import('./pages/public/PromotionsPage'));

// --- LAZY LOAD AUTH PAGES ---
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));

// --- LAZY LOAD CUSTOMER PAGES ---
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const CustomerProfile = React.lazy(() => import('./pages/customer/CustomerProfile'));
const OrdersPage = React.lazy(() => import('./pages/customer/OrdersPage'));
const MyChatsPage = React.lazy(() => import('./pages/customer/MyChatsPage'));
const VnpayReturn = React.lazy(() => import('./pages/customer/VnpayReturn'));

// Loading fallback component
const PageLoader = () => <LoadingSpinner fullScreen />;


function App() {
  return (
    // Bọc toàn bộ ứng dụng bằng Provider để các trang có thể dùng chung trạng thái đặt phòng
    <BookingProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

        {/* KÍCH HOẠT SCROLLTOTOP TẠI ĐÂY */}
        <ScrollToTop />

        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ====== ROUTE CHO KHÁCH VÀO XEM THÔNG TIN CHUNG ====== */}
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<ListingPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />

              {/* ====== AUTH ROUTES (Đăng nhập / Đăng ký) ====== */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ====== CUSTOMER ROUTES (Yêu cầu đăng nhập - Bạn có thể thêm thẻ bọc PrivateRoute sau này) ====== */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<CustomerProfile />} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/messages" element={<MyChatsPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/payment/vnpay-return" element={<VnpayReturn />} />

              {/* ====== FALLBACK ROUTE (Chặn đường dẫn sai) ====== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;