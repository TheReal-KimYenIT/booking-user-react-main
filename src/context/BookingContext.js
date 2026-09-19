import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Khóa lưu dữ liệu đơn đặt phòng ở localStorage để dùng lại sau khi reload
const STORAGE_KEY = 'booking_user_orders_v1';

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

const BookingContext = createContext(null);

// Provider dùng để quản lý đơn đặt phòng tạm thời cho các component con
export function BookingProvider({ children }) {
  const [orders, setOrders] = useState(() => loadOrders());

  // Thêm một đơn mới vào danh sách và lưu luôn vào localStorage
  const addOrder = useCallback((order) => {
    setOrders((prev) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const next = [
        {
          ...order,
          id,
          createdAt: new Date().toISOString(),
          payAtHotel: true,
        },
        ...prev,
      ];
      saveOrders(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ orders, addOrder }),
    [orders, addOrder]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookingOrders() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingOrders must be used within BookingProvider');
  }
  return ctx;
}
