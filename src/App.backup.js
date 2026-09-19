import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import ScrollToTop from './components/common/ScrollToTop'; // Bạn đã import rất chuẩn

// --- IMPORT COMPONENTS ---
import Layout from './components/common/Layout';

// --- IMPORT PUBLIC PAGES ---
import HomePage from './pages/public/HomePage';
import ListingPage from './pages/public/ListingPage';
import HotelDetailPage from './pages/public/HotelDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// --- IMPORT AUTH PAGES ---
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// --- IMPORT CUSTOMER PAGES ---
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerProfile from './pages/customer/CustomerProfile';
import OrdersPage from './pages/customer/OrdersPage';
import MyChatsPage from './pages/customer/MyChatsPage';
import PromotionsPage from './pages/public/PromotionsPage';
import VnpayReturn from './pages/customer/VnpayReturn';

// --- IMPORT GLOBAL CSS ---
import './App.css';

function App() {
  return (
    // Bọc toàn bộ ứng dụng bằng Provider để các trang có thể dùng chung trạng thái đặt phòng
    <BookingProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

        {/* KÍCH HOẠT SCROLLTOTOP TẠI ĐÂY */}
        <ScrollToTop />

        <Layout>
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
        </Layout>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;