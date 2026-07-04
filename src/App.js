import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';

// --- IMPORT COMPONENTS ---
import Layout from './components/common/Layout'; // Đã trỏ đúng vào thư mục common

// --- IMPORT PUBLIC PAGES ---
import HomePage from './pages/public/HomePage';
import ListingPage from './pages/public/ListingPage';
import HotelDetailPage from './pages/public/HotelDetailPage';
import AboutPage from './pages/public/AboutPage';

// --- IMPORT AUTH PAGES ---
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// --- IMPORT CUSTOMER PAGES ---
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerProfile from './pages/customer/CustomerProfile';
import OrdersPage from './pages/customer/OrdersPage';
import MyChatsPage from './pages/customer/MyChatsPage';
import PromotionsPage from './pages/public/PromotionsPage';

// --- IMPORT GLOBAL CSS ---
import './App.css';

function App() {
  return (
    <BookingProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            {/* ====== PUBLIC ROUTES (Ai cũng xem được) ====== */}
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
            <Route path="/messages" element={<MyChatsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />

            {/* ====== FALLBACK ROUTE (Chặn đường dẫn sai) ====== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;